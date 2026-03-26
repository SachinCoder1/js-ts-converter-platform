import { NextRequest, NextResponse } from 'next/server';
import { convertCurlToCode } from '@/lib/server/curl-to-code/converter';
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
import { looksLikeCurl } from '@/lib/security/validators/curl';
import type { AIProvider, CurlToCodeOptions, CurlTargetLanguage, CurlCodeStyle, CurlErrorHandling, CurlVariableStyle } from '@/lib/types';

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];
const VALID_TARGET_LANGUAGES: CurlTargetLanguage[] = [
  'js-fetch', 'js-axios', 'ts-fetch',
  'python-requests', 'go-net-http', 'rust-reqwest',
  'php-curl', 'ruby-net-http',
];
const VALID_CODE_STYLES: CurlCodeStyle[] = ['async-await', 'promises', 'callback'];
const VALID_ERROR_HANDLING: CurlErrorHandling[] = ['try-catch', 'none'];
const VALID_VARIABLE_STYLES: CurlVariableStyle[] = ['hardcoded', 'extracted'];

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';

  const fingerprint = createFingerprint(ip, userAgent, acceptLanguage);
  if (isBotLike(ip, userAgent, fingerprint)) {
    return NextResponse.json({ error: 'Request blocked' }, { status: 403 });
  }
  recordRequest(fingerprint);

  if (isFailureBlocked(ip)) {
    return NextResponse.json(
      { error: 'Too many failed requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

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

    const { curl, options, preferredProvider } = body as Record<string, unknown>;

    if (typeof curl !== 'string') {
      recordFailure(ip);
      return NextResponse.json({ error: 'curl must be a string' }, { status: 400 });
    }

    if (curl.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid characters in input' }, { status: 400 });
    }

    if (new TextEncoder().encode(curl).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input exceeds maximum size of 50KB' }, { status: 413 });
    }

    if (!looksLikeCurl(curl)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input does not appear to be a valid cURL command' }, { status: 400 });
    }

    if (!options || typeof options !== 'object') {
      recordFailure(ip);
      return NextResponse.json({ error: 'options is required' }, { status: 400 });
    }

    const opts = options as Record<string, unknown>;

    if (!VALID_TARGET_LANGUAGES.includes(opts.targetLanguage as CurlTargetLanguage)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid targetLanguage' }, { status: 400 });
    }
    if (!VALID_CODE_STYLES.includes(opts.codeStyle as CurlCodeStyle)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid codeStyle' }, { status: 400 });
    }
    if (!VALID_ERROR_HANDLING.includes(opts.errorHandling as CurlErrorHandling)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid errorHandling' }, { status: 400 });
    }
    if (!VALID_VARIABLE_STYLES.includes(opts.variableStyle as CurlVariableStyle)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid variableStyle' }, { status: 400 });
    }

    const validatedOptions: CurlToCodeOptions = {
      targetLanguage: opts.targetLanguage as CurlTargetLanguage,
      codeStyle: opts.codeStyle as CurlCodeStyle,
      errorHandling: opts.errorHandling as CurlErrorHandling,
      variableStyle: opts.variableStyle as CurlVariableStyle,
    };

    if (preferredProvider !== undefined && !VALID_PROVIDERS.includes(preferredProvider as AIProvider)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const result = await convertCurlToCode({
      curl,
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
