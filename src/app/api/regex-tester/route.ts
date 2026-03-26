import { NextRequest, NextResponse } from 'next/server';
import { handleRegexExplain, handleRegexConvert } from '@/lib/server/regex-tester/converter';
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
import type { AIProvider, RegexFlavor } from '@/lib/types';

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];
const VALID_FLAVORS: RegexFlavor[] = ['javascript', 'python', 'go', 'rust', 'php', 'java'];
const VALID_FLAGS = /^[gimsuy]*$/;
const MAX_PATTERN_SIZE = 1024; // 1KB

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
      { status: 429 },
    );
  }

  if (!checkGlobalRateLimit()) {
    return NextResponse.json(
      { error: 'Service is experiencing high demand. Please try again later.' },
      { status: 503 },
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
      },
    );
  }

  if (!checkConcurrent(ip)) {
    return NextResponse.json(
      { error: 'Too many concurrent requests. Please wait.' },
      { status: 429 },
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

    const { action, pattern, flags, sourceFlavor, targetFlavors, preferredProvider } =
      body as Record<string, unknown>;

    // Validate common fields
    if (typeof pattern !== 'string' || !pattern.trim()) {
      recordFailure(ip);
      return NextResponse.json({ error: 'pattern must be a non-empty string' }, { status: 400 });
    }

    if (pattern.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid characters in pattern' }, { status: 400 });
    }

    if (new TextEncoder().encode(pattern).length > MAX_PATTERN_SIZE) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Pattern exceeds maximum size of 1KB' }, { status: 413 });
    }

    if (typeof flags !== 'string' || !VALID_FLAGS.test(flags)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid flags' }, { status: 400 });
    }

    if (!VALID_FLAVORS.includes(sourceFlavor as RegexFlavor)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid sourceFlavor' }, { status: 400 });
    }

    if (
      preferredProvider !== undefined &&
      !VALID_PROVIDERS.includes(preferredProvider as AIProvider)
    ) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    if (action === 'explain') {
      const result = await handleRegexExplain(
        pattern,
        flags,
        sourceFlavor as RegexFlavor,
        preferredProvider as AIProvider | undefined,
      );

      return NextResponse.json(result, {
        headers: {
          'X-Cache': result.fromCache ? 'HIT' : 'MISS',
          'X-RateLimit-Limit': String(info.limit),
          'X-RateLimit-Remaining': String(info.remaining),
          'X-RateLimit-Reset': String(info.reset),
          'Cache-Control': 'no-store',
        },
      });
    }

    if (action === 'convert') {
      if (!Array.isArray(targetFlavors) || targetFlavors.length === 0 || targetFlavors.length > 6) {
        recordFailure(ip);
        return NextResponse.json(
          { error: 'targetFlavors must be an array of 1-6 valid flavors' },
          { status: 400 },
        );
      }

      for (const f of targetFlavors) {
        if (!VALID_FLAVORS.includes(f as RegexFlavor)) {
          recordFailure(ip);
          return NextResponse.json({ error: `Invalid target flavor: ${f}` }, { status: 400 });
        }
      }

      const result = await handleRegexConvert(
        pattern,
        flags,
        sourceFlavor as RegexFlavor,
        targetFlavors as RegexFlavor[],
        preferredProvider as AIProvider | undefined,
      );

      return NextResponse.json(result, {
        headers: {
          'X-Cache': result.fromCache ? 'HIT' : 'MISS',
          'X-RateLimit-Limit': String(info.limit),
          'X-RateLimit-Remaining': String(info.remaining),
          'X-RateLimit-Reset': String(info.reset),
          'Cache-Control': 'no-store',
        },
      });
    }

    recordFailure(ip);
    return NextResponse.json({ error: 'Invalid action. Must be "explain" or "convert".' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 },
    );
  } finally {
    releaseConcurrent(ip);
  }
}
