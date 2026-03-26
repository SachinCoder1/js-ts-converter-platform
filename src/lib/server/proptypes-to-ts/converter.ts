import 'server-only';
import type { PropTypesToTsRequest, PropTypesToTsResult, AIProvider, PropTypesToTsStats } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callOpenAI } from '../ai-providers/openai';
import { callKimi } from '../ai-providers/kimi';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildPropTypesToTsPrompt } from './ai-prompt';
import { propTypesToTsAst } from './ast-convert';
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

export async function convertPropTypesToTs(request: PropTypesToTsRequest): Promise<PropTypesToTsResult> {
  const startTime = Date.now();

  try {
    const cacheKey = await hashCode(request.code, JSON.stringify(request.options));

    // Check cache
    const cached = await getFromCache(cacheKey, 'proptypes');
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
    const prompt = buildPropTypesToTsPrompt(request.code, request.options);
    const chain = buildChain(request.preferredProvider);

    // Try each provider
    for (const providerName of chain) {
      try {
        const callFn = providerMap[providerName];
        const rawOutput = await callFn(prompt);

        const cleaned = stripMarkdownFences(rawOutput);

        if (!sanitizeOutput(cleaned)) continue;

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.code.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.code.length, outputLength: cleaned.length });
        }

        // Validate it parses as TypeScript
        const parseResult = parseTypeScript(cleaned);
        if (!parseResult.ast) continue;

        const stats = computeStats(cleaned);

        const result: PropTypesToTsResult = {
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
          stats: { interfacesCreated: stats.interfacesCreated, typesAdded: stats.propsConverted, anyCount: 0 },
          duration: result.duration,
        }, 'proptypes');

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

function astOnlyFallback(request: PropTypesToTsRequest, startTime: number): PropTypesToTsResult {
  try {
    const astResult = propTypesToTsAst(request.code, request.options);
    return {
      convertedCode: astResult.code,
      provider: 'ast-only',
      fromCache: false,
      stats: astResult.stats,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '// Could not parse PropTypes',
      provider: 'ast-only',
      fromCache: false,
      stats: { propsConverted: 0, interfacesCreated: 0, requiredProps: 0, optionalProps: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(code: string): PropTypesToTsStats {
  const interfaceMatches = code.match(/interface\s+\w+/g);
  const fieldMatches = code.match(/^\s+\w+\??\s*:/gm);
  const requiredMatches = code.match(/^\s+\w+\s*:/gm);
  const optionalMatches = code.match(/^\s+\w+\?\s*:/gm);

  return {
    propsConverted: fieldMatches?.length || 0,
    interfacesCreated: interfaceMatches?.length || 0,
    requiredProps: (requiredMatches?.length || 0) - (optionalMatches?.length || 0),
    optionalProps: optionalMatches?.length || 0,
  };
}
