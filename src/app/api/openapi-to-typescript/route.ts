import { NextRequest, NextResponse } from 'next/server';
import { convertOpenApiToTs } from '@/lib/server/openapi-to-ts/converter';
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
import { checkYamlDepth } from '@/lib/yaml-to-json';
import type { AIProvider, OpenApiToTsOptions } from '@/lib/types';

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'deepseek', 'openrouter', 'ast-only'];
const VALID_SPEC_VERSIONS = ['auto', 'openapi3', 'swagger2'];
const VALID_INPUT_FORMATS = ['json', 'yaml'];
const VALID_OUTPUT_MODES = ['interfaces-only', 'interfaces-and-client', 'interfaces-and-fetch'];
const VALID_ENUM_STYLES = ['union', 'enum'];

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

    const { spec, options, preferredProvider } = body as Record<string, unknown>;

    // Validate spec input
    if (typeof spec !== 'string') {
      recordFailure(ip);
      return NextResponse.json({ error: 'spec must be a string' }, { status: 400 });
    }

    if (spec.includes('\0')) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid characters in input' }, { status: 400 });
    }

    if (new TextEncoder().encode(spec).length > MAX_CODE_SIZE) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Input exceeds maximum size of 50KB' }, { status: 413 });
    }

    // Validate spec is parseable
    try {
      const opts = options as Record<string, unknown>;
      const format = opts?.inputFormat === 'yaml' ? 'yaml' : 'json';
      if (format === 'yaml') {
        const yaml = await import('js-yaml');
        const parsed = yaml.load(spec, { schema: yaml.JSON_SCHEMA });
        if (!checkYamlDepth(parsed)) {
          recordFailure(ip);
          return NextResponse.json({ error: 'YAML exceeds maximum nesting depth' }, { status: 400 });
        }
      } else {
        JSON.parse(spec);
      }
    } catch {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid spec format — could not parse as JSON or YAML' }, { status: 400 });
    }

    // Validate options
    if (!options || typeof options !== 'object') {
      recordFailure(ip);
      return NextResponse.json({ error: 'options is required' }, { status: 400 });
    }

    const opts = options as Record<string, unknown>;
    if (!VALID_SPEC_VERSIONS.includes(opts.specVersion as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid specVersion' }, { status: 400 });
    }
    if (!VALID_INPUT_FORMATS.includes(opts.inputFormat as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid inputFormat' }, { status: 400 });
    }
    if (!VALID_OUTPUT_MODES.includes(opts.outputMode as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid outputMode' }, { status: 400 });
    }
    if (!VALID_ENUM_STYLES.includes(opts.enumStyle as string)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid enumStyle' }, { status: 400 });
    }

    const validatedOptions: OpenApiToTsOptions = {
      specVersion: opts.specVersion as OpenApiToTsOptions['specVersion'],
      inputFormat: opts.inputFormat as OpenApiToTsOptions['inputFormat'],
      outputMode: opts.outputMode as OpenApiToTsOptions['outputMode'],
      enumStyle: opts.enumStyle as OpenApiToTsOptions['enumStyle'],
      addJsDoc: Boolean(opts.addJsDoc),
    };

    if (preferredProvider !== undefined && !VALID_PROVIDERS.includes(preferredProvider as AIProvider)) {
      recordFailure(ip);
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const result = await convertOpenApiToTs({
      spec,
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
