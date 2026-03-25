import 'server-only';
import type { JsonToTsRequest, JsonToTsResult, JsonToTsStats, AIProvider } from '../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../utils';
import { getFromCache, setCache } from './cache';
import { callGemini } from './ai-providers/gemini';
import { callDeepSeek } from './ai-providers/deepseek';
import { callOpenRouter } from './ai-providers/openrouter';
import { buildJsonToTsPrompt } from './json-to-ts-prompt';
import { parseTypeScript } from '../ast/parser';
import { jsonToTypeScript } from '../json-to-ts';
import type { PromptParts } from './ai-prompt';
import { logSecurityEvent } from '@/lib/server/security-logger';

type ProviderCallFn = (prompt: PromptParts) => Promise<string>;

const providerCallMap: Record<Exclude<AIProvider, 'ast-only'>, ProviderCallFn> = {
  gemini: callGemini,
  deepseek: callDeepSeek,
  openrouter: callOpenRouter,
};

const defaultChain: Exclude<AIProvider, 'ast-only'>[] = ['gemini', 'deepseek', 'openrouter'];

const CACHE_PREFIX = 'json-ts';

export async function convertJsonToTs(request: JsonToTsRequest): Promise<JsonToTsResult> {
  const startTime = Date.now();

  try {
    // Cache key incorporates options
    const optionsStr = JSON.stringify(request.options);
    const cacheKey = await hashCode(request.json + optionsStr, 'json-to-ts');

    // Check cache
    const cached = await getFromCache(cacheKey, CACHE_PREFIX);
    if (cached) {
      return {
        convertedCode: cached.convertedCode,
        provider: cached.provider,
        fromCache: true,
        stats: cached.stats as unknown as JsonToTsStats,
        duration: Date.now() - startTime,
      };
    }

    // Build provider chain
    const chain = buildChain(request.preferredProvider);

    // Build prompt
    const prompt = buildJsonToTsPrompt(request.json, request.options);

    // Try each AI provider
    for (const providerName of chain) {
      try {
        const callFn = providerCallMap[providerName];
        const rawOutput = await callFn(prompt);
        const cleaned = stripMarkdownFences(rawOutput);

        if (!sanitizeOutput(cleaned)) continue;

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.json.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.json.length, outputLength: cleaned.length });
        }

        // Validate it parses as TypeScript
        const parseResult = parseTypeScript(cleaned);
        if (!parseResult.ast) continue;

        const stats = computeStats(cleaned);

        const result: JsonToTsResult = {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats,
          duration: Date.now() - startTime,
        };

        // Cache the result (store as ConversionResult-compatible shape)
        await setCache(cacheKey, {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats: stats as unknown as import('../types').ConversionStats,
          duration: result.duration,
        }, CACHE_PREFIX);

        return result;
      } catch {
        continue;
      }
    }

    // All AI providers failed — fall back to local conversion
    return localFallback(request, startTime);
  } catch {
    return localFallback(request, startTime);
  }
}

function buildChain(preferred?: AIProvider): Exclude<AIProvider, 'ast-only'>[] {
  if (!preferred || preferred === 'ast-only') return defaultChain;
  const rest = defaultChain.filter(p => p !== preferred);
  return [preferred as Exclude<AIProvider, 'ast-only'>, ...rest];
}

function localFallback(request: JsonToTsRequest, startTime: number): JsonToTsResult {
  try {
    const localResult = jsonToTypeScript(request.json, request.options);
    return {
      convertedCode: localResult.code,
      provider: 'ast-only',
      fromCache: false,
      stats: localResult.stats,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '// Failed to generate types from JSON',
      provider: 'ast-only',
      fromCache: false,
      stats: { interfacesCreated: 0, propertiesTyped: 0, nullableFields: 0, arrayTypes: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(code: string): JsonToTsStats {
  const interfaceMatches = code.match(/\binterface\s+\w+/g);
  const typeMatches = code.match(/\btype\s+\w+\s*=/g);
  const interfacesCreated = (interfaceMatches?.length || 0) + (typeMatches?.length || 0);

  // Count property lines (key: type patterns)
  const propertyMatches = code.match(/^\s+(?:readonly\s+)?[\w"]+\??\s*:/gm);
  const propertiesTyped = propertyMatches?.length || 0;

  // Count nullable fields
  const nullableMatches = code.match(/\|\s*null/g);
  const nullableFields = nullableMatches?.length || 0;

  // Count array types
  const arrayMatches = code.match(/\w+\[\]/g);
  const arrayTypes = arrayMatches?.length || 0;

  return { interfacesCreated, propertiesTyped, nullableFields, arrayTypes };
}
