import { NextRequest, NextResponse } from 'next/server';
import { convertTailwind } from '@/lib/server/tailwind-to-css/converter';
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
import type { AIProvider } from '@/lib/types';
import type { TailwindInputFormat, TailwindOutputFormat, TailwindVersion } from '@/lib/tailwind-types';

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];
const VALID_INPUT_FORMATS: TailwindInputFormat[] = ['classes', 'html'];
const VALID_OUTPUT_FORMATS: TailwindOutputFormat[] = ['single', 'grouped', 'media-queries'];
const VALID_TW_VERSIONS: TailwindVersion[] = ['v3', 'v4'];

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

    const { input, options, preferredProvider } = body as Record<string, unknown>;

    // Validate input
    if (typeof input !== 'string') {
      recordFailure(ip);
      return NextResponse.json({ error: 'input must be a string' }, { status: 400 });
    }
    if (input.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid characters in input' }, { status: 400 });
    }
    if (new TextEncoder().encode(input).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input exceeds maximum size of 50KB' }, { status: 413 });
    }

    // Validate options
    if (!options || typeof options !== 'object') {
      recordFailure(ip);
      return NextResponse.json({ error: 'options must be an object' }, { status: 400 });
    }

    const opts = options as Record<string, unknown>;
    if (!VALID_INPUT_FORMATS.includes(opts.inputFormat as TailwindInputFormat)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid inputFormat' }, { status: 400 });
    }
    if (!VALID_OUTPUT_FORMATS.includes(opts.outputFormat as TailwindOutputFormat)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid outputFormat' }, { status: 400 });
    }
    if (!VALID_TW_VERSIONS.includes(opts.twVersion as TailwindVersion)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid twVersion' }, { status: 400 });
    }
    if (typeof opts.includeComments !== 'boolean') {
      recordFailure(ip);
      return NextResponse.json({ error: 'includeComments must be a boolean' }, { status: 400 });
    }

    // Validate provider (optional)
    if (preferredProvider !== undefined && !VALID_PROVIDERS.includes(preferredProvider as AIProvider)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Convert
    const result = await convertTailwind({
      input,
      options: {
        inputFormat: opts.inputFormat as TailwindInputFormat,
        outputFormat: opts.outputFormat as TailwindOutputFormat,
        twVersion: opts.twVersion as TailwindVersion,
        includeComments: opts.includeComments as boolean,
      },
      preferredProvider: preferredProvider as AIProvider | undefined,
    });

    return NextResponse.json(result, {
      headers: {
        'X-Cache': result.fromCache ? 'HIT' : 'MISS',
        'X-RateLimit-Limit': String(info.limit),
        'X-RateLimit-Remaining': String(info.remaining),
        'X-RateLimit-Reset': String(info.reset),
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    );
  } finally {
    releaseConcurrent(ip);
  }
}
