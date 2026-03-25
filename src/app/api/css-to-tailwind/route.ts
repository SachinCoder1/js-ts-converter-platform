import { NextRequest, NextResponse } from 'next/server';
import { convertCssToTailwind } from '@/lib/server/css-to-tailwind/converter';
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
import { looksLikeCSS } from '@/lib/security/validators/css';
import type { AIProvider, CssToTailwindOptions } from '@/lib/types';

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];
const VALID_TW_VERSIONS = ['v3', 'v4'];
const VALID_ARBITRARY = ['allow', 'closest-match'];
const VALID_OUTPUT_FORMATS = ['classes-only', 'html-structure', 'apply'];
const VALID_COLOR_FORMATS = ['named', 'arbitrary-hex'];

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';

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

  if (!checkConcurrent(ip)) {
    return NextResponse.json(
      { error: 'Too many concurrent requests. Please wait.' },
      { status: 429 }
    );
  }

  try {
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

    const { css, options, preferredProvider } = body as Record<string, unknown>;

    if (typeof css !== 'string') {
      recordFailure(ip);
      return NextResponse.json({ error: 'css must be a string' }, { status: 400 });
    }

    if (css.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid characters in input' }, { status: 400 });
    }

    if (new TextEncoder().encode(css).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input exceeds maximum size of 50KB' }, { status: 413 });
    }

    if (!looksLikeCSS(css)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input does not appear to be valid CSS' }, { status: 400 });
    }

    if (!options || typeof options !== 'object') {
      recordFailure(ip);
      return NextResponse.json({ error: 'options is required' }, { status: 400 });
    }

    const opts = options as Record<string, unknown>;

    if (!VALID_TW_VERSIONS.includes(opts.tailwindVersion as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid tailwindVersion' }, { status: 400 });
    }
    if (!VALID_ARBITRARY.includes(opts.arbitraryValues as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid arbitraryValues' }, { status: 400 });
    }
    if (!VALID_OUTPUT_FORMATS.includes(opts.outputFormat as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid outputFormat' }, { status: 400 });
    }
    if (!VALID_COLOR_FORMATS.includes(opts.colorFormat as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid colorFormat' }, { status: 400 });
    }

    const validatedOptions: CssToTailwindOptions = {
      tailwindVersion: opts.tailwindVersion as 'v3' | 'v4',
      arbitraryValues: opts.arbitraryValues as 'allow' | 'closest-match',
      outputFormat: opts.outputFormat as 'classes-only' | 'html-structure' | 'apply',
      prefix: typeof opts.prefix === 'string' ? opts.prefix.replace(/[^a-zA-Z0-9-_]/g, '') : '',
      colorFormat: opts.colorFormat as 'named' | 'arbitrary-hex',
    };

    if (preferredProvider !== undefined && !VALID_PROVIDERS.includes(preferredProvider as AIProvider)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const result = await convertCssToTailwind({
      css,
      options: validatedOptions,
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
