import 'server-only';
import type { OpenApiToTsRequest, OpenApiToTsResult, AIProvider, OpenApiToTsStats } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildOpenApiToTsPrompt } from '../../openapi-to-ts/ai-prompt';
import { openApiToTsAst } from '../../openapi-to-ts/ast-convert';
import { parseTypeScript } from '../../ast/parser';
import type { PromptParts } from '../ai-prompt';
import { logSecurityEvent } from '@/lib/server/security-logger';

type ProviderCallFn = (prompt: PromptParts) => Promise<string>;

const providerMap: Record<Exclude<AIProvider, 'ast-only'>, ProviderCallFn> = {
  gemini: callGemini,
  deepseek: callDeepSeek,
  openrouter: callOpenRouter,
};

const defaultChain: Exclude<AIProvider, 'ast-only'>[] = ['gemini', 'deepseek', 'openrouter'];

export async function convertOpenApiToTs(request: OpenApiToTsRequest): Promise<OpenApiToTsResult> {
  const startTime = Date.now();

  try {
    const cacheKey = await hashCode(request.spec, JSON.stringify(request.options));

    // Check cache
    const cached = await getFromCache(cacheKey, 'openapi-ts');
    if (cached) {
      return {
        convertedCode: cached.convertedCode,
        provider: cached.provider,
        fromCache: true,
        stats: computeStats(cached.convertedCode),
        duration: Date.now() - startTime,
      };
    }

    // If AST-only is requested, skip AI
    if (request.preferredProvider === 'ast-only') {
      return astOnlyFallback(request, startTime);
    }

    // Build prompt
    const prompt = buildOpenApiToTsPrompt(request.spec, request.options);
    const chain = buildChain(request.preferredProvider);

    // Try each provider
    for (const providerName of chain) {
      try {
        const callFn = providerMap[providerName];
        const rawOutput = await callFn(prompt);

        const cleaned = stripMarkdownFences(rawOutput);

        if (!sanitizeOutput(cleaned)) continue;

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.spec.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.spec.length, outputLength: cleaned.length });
        }

        // Validate it parses as TypeScript
        const parseResult = parseTypeScript(cleaned);
        if (!parseResult.ast) continue;

        const stats = computeStats(cleaned);

        const result: OpenApiToTsResult = {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats,
          duration: Date.now() - startTime,
        };

        // Cache the result
        await setCache(cacheKey, {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats: { interfacesCreated: stats.schemasConverted, typesAdded: stats.endpointsTyped, anyCount: 0 },
          duration: result.duration,
        }, 'openapi-ts');

        return result;
      } catch {
        continue;
      }
    }

    return astOnlyFallback(request, startTime);
  } catch {
    return astOnlyFallback(request, startTime);
  }
}

function buildChain(preferred?: AIProvider): Exclude<AIProvider, 'ast-only'>[] {
  if (!preferred || preferred === 'ast-only') return defaultChain;
  const rest = defaultChain.filter(p => p !== preferred);
  return [preferred as Exclude<AIProvider, 'ast-only'>, ...rest];
}

function astOnlyFallback(request: OpenApiToTsRequest, startTime: number): OpenApiToTsResult {
  try {
    const astResult = openApiToTsAst(request.spec, request.options);
    return {
      convertedCode: astResult.code,
      provider: 'ast-only',
      fromCache: false,
      stats: astResult.stats,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '// Failed to parse OpenAPI spec',
      provider: 'ast-only',
      fromCache: false,
      stats: { schemasConverted: 0, endpointsTyped: 0, enumsGenerated: 0, refsResolved: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(code: string): OpenApiToTsStats {
  const interfaceMatches = code.match(/\binterface\s+\w+/g);
  const typeMatches = code.match(/\btype\s+\w+/g);
  const enumMatches = code.match(/\benum\s+\w+/g);
  const endpointMatches = code.match(/\b(?:Params|Body|Response)\b/g);
  const refMatches = code.match(/\b[A-Z][a-zA-Z]*(?=[\s;,\[\]|&)])/g);

  return {
    schemasConverted: (interfaceMatches?.length || 0) + (typeMatches?.length || 0),
    endpointsTyped: endpointMatches?.length || 0,
    enumsGenerated: enumMatches?.length || 0,
    refsResolved: refMatches?.length || 0,
  };
}
