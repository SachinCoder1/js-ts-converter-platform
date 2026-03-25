import { NextRequest, NextResponse } from 'next/server';
import { convertSqlToTs } from '@/lib/server/sql-to-ts/converter';
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
import { looksLikeSQL } from '@/lib/security/validators/sql';
import type { AIProvider, SqlToTsOptions } from '@/lib/types';

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];
const VALID_DIALECTS = ['postgresql', 'mysql', 'sqlite'];
const VALID_DATE_HANDLING = ['date-object', 'string'];
const VALID_NULLABLE_STYLES = ['union-null', 'optional'];
const VALID_OUTPUT_FORMATS = ['interfaces', 'prisma', 'drizzle'];
const VALID_GENERATE_MODES = ['select-only', 'select-insert'];

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

    const { sql, options, preferredProvider } = body as Record<string, unknown>;

    // Validate sql input
    if (typeof sql !== 'string') {
      recordFailure(ip);
      return NextResponse.json({ error: 'sql must be a string' }, { status: 400 });
    }

    if (sql.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid characters in input' }, { status: 400 });
    }

    if (new TextEncoder().encode(sql).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input exceeds maximum size of 50KB' }, { status: 413 });
    }

    if (!looksLikeSQL(sql)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input does not appear to be valid SQL' }, { status: 400 });
    }

    // Validate options
    if (!options || typeof options !== 'object') {
      recordFailure(ip);
      return NextResponse.json({ error: 'options is required' }, { status: 400 });
    }

    const opts = options as Record<string, unknown>;
    if (!VALID_DIALECTS.includes(opts.dialect as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid dialect' }, { status: 400 });
    }
    if (!VALID_DATE_HANDLING.includes(opts.dateHandling as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid dateHandling' }, { status: 400 });
    }
    if (!VALID_NULLABLE_STYLES.includes(opts.nullableStyle as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid nullableStyle' }, { status: 400 });
    }
    if (!VALID_OUTPUT_FORMATS.includes(opts.outputFormat as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid outputFormat' }, { status: 400 });
    }
    if (!VALID_GENERATE_MODES.includes(opts.generateMode as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid generateMode' }, { status: 400 });
    }

    const validatedOptions: SqlToTsOptions = {
      dialect: opts.dialect as SqlToTsOptions['dialect'],
      dateHandling: opts.dateHandling as SqlToTsOptions['dateHandling'],
      nullableStyle: opts.nullableStyle as SqlToTsOptions['nullableStyle'],
      outputFormat: opts.outputFormat as SqlToTsOptions['outputFormat'],
      generateMode: opts.generateMode as SqlToTsOptions['generateMode'],
    };

    if (preferredProvider !== undefined && !VALID_PROVIDERS.includes(preferredProvider as AIProvider)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const result = await convertSqlToTs({
      sql,
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
