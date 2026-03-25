import 'server-only';
import type { GraphqlToTsRequest, GraphqlToTsResult, AIProvider, GraphqlToTsStats } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildGraphqlToTsPrompt } from '../../graphql-to-ts/ai-prompt';
import { graphqlToTsAst } from '../../graphql-to-ts/ast-convert';
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

export async function convertGraphqlToTs(request: GraphqlToTsRequest): Promise<GraphqlToTsResult> {
  const startTime = Date.now();

  try {
    const cacheKey = await hashCode(request.graphql, JSON.stringify(request.options));

    // Check cache
    const cached = await getFromCache(cacheKey, 'gql-ts');
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
    const prompt = buildGraphqlToTsPrompt(request.graphql, request.options);
    const chain = buildChain(request.preferredProvider);

    // Try each provider
    for (const providerName of chain) {
      try {
        const callFn = providerMap[providerName];
        const rawOutput = await callFn(prompt);

        const cleaned = stripMarkdownFences(rawOutput);

        if (!sanitizeOutput(cleaned)) continue;

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.graphql.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.graphql.length, outputLength: cleaned.length });
        }

        // Validate it parses as TypeScript
        const parseResult = parseTypeScript(cleaned);
        if (!parseResult.ast) continue;

        const stats = computeStats(cleaned);

        const result: GraphqlToTsResult = {
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
          stats: { interfacesCreated: stats.typesGenerated, typesAdded: stats.fieldsTyped, anyCount: 0 },
          duration: result.duration,
        }, 'gql-ts');

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

function astOnlyFallback(request: GraphqlToTsRequest, startTime: number): GraphqlToTsResult {
  try {
    const astResult = graphqlToTsAst(request.graphql, request.options);
    return {
      convertedCode: astResult.code,
      provider: 'ast-only',
      fromCache: false,
      stats: astResult.stats,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '// Failed to parse GraphQL schema',
      provider: 'ast-only',
      fromCache: false,
      stats: { typesGenerated: 0, enumsConverted: 0, fieldsTyped: 0, inputTypesGenerated: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(code: string): GraphqlToTsStats {
  const interfaceMatches = code.match(/\binterface\s+\w+/g);
  const typeMatches = code.match(/\btype\s+\w+/g);
  const enumMatches = code.match(/\benum\s+\w+/g);
  const fieldMatches = code.match(/^\s+(?:readonly\s+)?\w+[?]?\s*:/gm);
  const inputMatches = code.match(/\binterface\s+\w*Input\b/g);

  return {
    typesGenerated: (interfaceMatches?.length || 0) + (typeMatches?.length || 0),
    enumsConverted: enumMatches?.length || 0,
    fieldsTyped: fieldMatches?.length || 0,
    inputTypesGenerated: inputMatches?.length || 0,
  };
}
