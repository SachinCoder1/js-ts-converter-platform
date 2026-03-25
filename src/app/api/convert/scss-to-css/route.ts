import { NextRequest, NextResponse } from 'next/server';
import * as sass from 'sass';
import {
  checkRateLimit,
  checkConcurrent,
  releaseConcurrent,
  createFingerprint,
  isBotLike,
  recordRequest,
  isFailureBlocked,
  checkGlobalRateLimit,
  recordFailure,
} from '@/lib/server/rate-limiter';
import { getClientIP } from '@/lib/server/request-utils';
import { logSecurityEvent } from '@/lib/server/security-logger';
import { MAX_CODE_SIZE } from '@/lib/constants';
import type { ScssSyntax, ScssOutputStyle } from '@/lib/types';

const VALID_SYNTAXES: ScssSyntax[] = ['scss', 'sass'];
const VALID_OUTPUT_STYLES: ScssOutputStyle[] = ['expanded', 'compressed'];

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';

  // Fingerprint and bot detection
  const fingerprint = createFingerprint(ip, userAgent, acceptLanguage);
  if (isBotLike(ip, userAgent, fingerprint)) {
    return NextResponse.json({ error: 'Request blocked' }, { status: 403 });
  }
  recordRequest(fingerprint);

  // Failure-based blocking
  if (isFailureBlocked(ip)) {
    return NextResponse.json(
      { error: 'Too many failed requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  // Global rate limit
  if (!checkGlobalRateLimit()) {
    return NextResponse.json(
      { error: 'Service is experiencing high demand. Please try again later.' },
      { status: 503 }
    );
  }

  // Rate limiting
  const { allowed, info } = checkRateLimit(ip);
  if (!allowed) {
    logSecurityEvent('rate_limit_hit', ip, { limit: info.limit, reset: info.reset });
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(info.reset),
          'X-RateLimit-Limit': String(info.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(info.reset),
        },
      }
    );
  }

  // Concurrent limit
  if (!checkConcurrent(ip)) {
    return NextResponse.json(
      { error: 'Too many concurrent requests. Please wait.' },
      { status: 429 }
    );
  }

  try {
    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { code, syntax, outputStyle } = body as Record<string, unknown>;

    // Validate code
    if (typeof code !== 'string') {
      recordFailure(ip);
      return NextResponse.json({ error: 'Code must be a string' }, { status: 400 });
    }
    if (code.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid characters in code' }, { status: 400 });
    }
    if (new TextEncoder().encode(code).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Code exceeds maximum size of 50KB' }, { status: 413 });
    }

    // Validate syntax
    if (!VALID_SYNTAXES.includes(syntax as ScssSyntax)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'syntax must be "scss" or "sass"' }, { status: 400 });
    }

    // Validate outputStyle
    if (!VALID_OUTPUT_STYLES.includes(outputStyle as ScssOutputStyle)) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'outputStyle must be "expanded" or "compressed"' },
        { status: 400 }
      );
    }

    // Compile SCSS/SASS
    const startTime = performance.now();
    const result = sass.compileString(code as string, {
      syntax: (syntax as string) === 'sass' ? 'indented' : 'scss',
      style: outputStyle as ScssOutputStyle,
    });
    const compilationTime = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        css: result.css,
        stats: { compilationTime },
      },
      {
        headers: {
          'X-RateLimit-Limit': String(info.limit),
          'X-RateLimit-Remaining': String(info.remaining),
          'X-RateLimit-Reset': String(info.reset),
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    // Sass compilation errors have structured messages
    if (err instanceof sass.Exception) {
      return NextResponse.json(
        {
          error: `Sass compilation error at line ${err.span.start.line + 1}, column ${err.span.start.column + 1}`,
          line: err.span.start.line,
          column: err.span.start.column,
        },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    );
  } finally {
    releaseConcurrent(ip);
  }
}
