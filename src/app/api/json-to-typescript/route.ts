import { NextRequest, NextResponse } from 'next/server';
import { convertJsonToTs } from '@/lib/server/json-to-ts-converter';
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
import type { AIProvider, JsonOutputStyle, JsonOptionalFields } from '@/lib/types';

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];
const VALID_OUTPUT_STYLES: JsonOutputStyle[] = ['interface', 'type'];
const VALID_OPTIONAL_FIELDS: JsonOptionalFields[] = ['required', 'optional', 'smart'];
const VALID_IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';

  // Fingerprint and bot detection
  const fingerprint = createFingerprint(ip, userAgent, acceptLanguage);
  if (isBotLike(ip, userAgent, fingerprint)) {
    return NextResponse.json(
      { error: 'Request blocked' },
      { status: 403 }
    );
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
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { json, options, preferredProvider } = body as Record<string, unknown>;

    // Validate json
    if (typeof json !== 'string') {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'json must be a string' },
        { status: 400 }
      );
    }

    if (json.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Invalid characters in input' },
        { status: 400 }
      );
    }

    if (new TextEncoder().encode(json).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Input exceeds maximum size of 50KB' },
        { status: 413 }
      );
    }

    // Validate it's parseable JSON
    try {
      JSON.parse(json);
    } catch {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Invalid JSON input. Please fix syntax errors.' },
        { status: 400 }
      );
    }

    // Validate options
    if (!options || typeof options !== 'object') {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'options is required' },
        { status: 400 }
      );
    }

    const opts = options as Record<string, unknown>;

    if (!VALID_OUTPUT_STYLES.includes(opts.outputStyle as JsonOutputStyle)) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'outputStyle must be "interface" or "type"' },
        { status: 400 }
      );
    }

    if (typeof opts.exportKeyword !== 'boolean') {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'exportKeyword must be a boolean' },
        { status: 400 }
      );
    }

    if (!VALID_OPTIONAL_FIELDS.includes(opts.optionalFields as JsonOptionalFields)) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'optionalFields must be "required", "optional", or "smart"' },
        { status: 400 }
      );
    }

    if (typeof opts.readonlyProperties !== 'boolean') {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'readonlyProperties must be a boolean' },
        { status: 400 }
      );
    }

    if (
      typeof opts.rootTypeName !== 'string' ||
      opts.rootTypeName.length === 0 ||
      opts.rootTypeName.length > 50 ||
      !VALID_IDENTIFIER_RE.test(opts.rootTypeName)
    ) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'rootTypeName must be a valid TypeScript identifier (1-50 chars)' },
        { status: 400 }
      );
    }

    // Validate preferredProvider
    if (preferredProvider !== undefined && !VALID_PROVIDERS.includes(preferredProvider as AIProvider)) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    const result = await convertJsonToTs({
      json: json as string,
      options: {
        outputStyle: opts.outputStyle as JsonOutputStyle,
        exportKeyword: opts.exportKeyword as boolean,
        optionalFields: opts.optionalFields as JsonOptionalFields,
        readonlyProperties: opts.readonlyProperties as boolean,
        rootTypeName: opts.rootTypeName as string,
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
