import 'server-only';
import type { JsonToZodRequest, JsonToZodResult, AIProvider, JsonToZodStats } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callOpenAI } from '../ai-providers/openai';
import { callKimi } from '../ai-providers/kimi';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildJsonToZodPrompt } from './ai-prompt';
import { jsonToZodAst } from './ast-convert';
import { parseTypeScript } from '../../ast/parser';
import type { PromptParts } from '../ai-prompt';
import { logSecurityEvent } from '@/lib/server/security-logger';

type ProviderCallFn = (prompt: PromptParts) => Promise<string>;

const providerMap: Record<Exclude<AIProvider, 'ast-only'>, ProviderCallFn> = {
  gemini: callGemini,
  openai: callOpenAI,
  kimi: callKimi,
  deepseek: callDeepSeek,
  openrouter: callOpenRouter,
};

const defaultChain: Exclude<AIProvider, 'ast-only'>[] = ['gemini', 'openai', 'kimi', 'deepseek', 'openrouter'];

export async function convertJsonToZod(request: JsonToZodRequest): Promise<JsonToZodResult> {
  const startTime = Date.now();

  try {
    const cacheKey = await hashCode(request.json, JSON.stringify(request.options));

    // Check cache
    const cached = await getFromCache(cacheKey, 'zod');
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
    const prompt = buildJsonToZodPrompt(request.json, request.options);
    const chain = buildChain(request.preferredProvider);

    // Try each provider
    for (const providerName of chain) {
      try {
        const callFn = providerMap[providerName];
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

        const result: JsonToZodResult = {
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
          stats: { interfacesCreated: stats.nestedObjectCount, typesAdded: stats.zodMethodsUsed, anyCount: 0 },
          duration: result.duration,
        }, 'zod');

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

function astOnlyFallback(request: JsonToZodRequest, startTime: number): JsonToZodResult {
  try {
    const astResult = jsonToZodAst(request.json, request.options);
    return {
      convertedCode: astResult.code,
      provider: 'ast-only',
      fromCache: false,
      stats: astResult.stats,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '// Invalid JSON input',
      provider: 'ast-only',
      fromCache: false,
      stats: { fieldsProcessed: 0, zodMethodsUsed: 0, nestedObjectCount: 0, arraysDetected: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(code: string): JsonToZodStats {
  const objectMatches = code.match(/z\.object\(/g);
  const methodMatches = code.match(/z\.\w+\(/g);
  const arrayMatches = code.match(/z\.array\(/g);
  const fieldMatches = code.match(/\w+:\s*z\./g);

  return {
    fieldsProcessed: fieldMatches?.length || 0,
    zodMethodsUsed: methodMatches?.length || 0,
    nestedObjectCount: objectMatches?.length || 0,
    arraysDetected: arrayMatches?.length || 0,
  };
}
