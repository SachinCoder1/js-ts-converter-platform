import { NextRequest, NextResponse } from 'next/server';
import { convertCode } from '@/lib/server/converter';
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
import type { AIProvider, FileType } from '@/lib/types';

const VALID_FILE_TYPES: FileType[] = ['js', 'jsx'];
const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];

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
    // Parse and validate body
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

    const { code, fileType, preferredProvider } = body as Record<string, unknown>;

    // Validate code
    if (typeof code !== 'string') {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Code must be a string' },
        { status: 400 }
      );
    }

    if (code.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Invalid characters in code' },
        { status: 400 }
      );
    }

    if (new TextEncoder().encode(code).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Code exceeds maximum size of 50KB' },
        { status: 413 }
      );
    }

    // Validate fileType
    if (!VALID_FILE_TYPES.includes(fileType as FileType)) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'fileType must be "js" or "jsx"' },
        { status: 400 }
      );
    }

    // Validate preferredProvider (optional)
    if (preferredProvider !== undefined && !VALID_PROVIDERS.includes(preferredProvider as AIProvider)) {
      recordFailure(ip);
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // Convert
    const result = await convertCode({
      code: code as string,
      fileType: fileType as FileType,
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
