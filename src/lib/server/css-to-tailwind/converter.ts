import 'server-only';
import type { CssToTailwindRequest, CssToTailwindResult, AIProvider, CssToTailwindStats } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callOpenAI } from '../ai-providers/openai';
import { callKimi } from '../ai-providers/kimi';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildCssToTailwindPrompt } from './ai-prompt';
import { cssToTailwindAst } from './ast-convert';
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

export async function convertCssToTailwind(request: CssToTailwindRequest): Promise<CssToTailwindResult> {
  const startTime = Date.now();

  try {
    const cacheKey = await hashCode(request.css, JSON.stringify(request.options));

    const cached = await getFromCache(cacheKey, 'tw');
    if (cached) {
      return {
        convertedCode: cached.convertedCode,
        provider: cached.provider,
        fromCache: true,
        stats: computeStats(cached.convertedCode),
        duration: Date.now() - startTime,
      };
    }

    if (request.preferredProvider === 'ast-only') {
      return astOnlyFallback(request, startTime);
    }

    const prompt = buildCssToTailwindPrompt(request.css, request.options);
    const chain = buildChain(request.preferredProvider);

    for (const providerName of chain) {
      try {
        const callFn = providerMap[providerName];
        const rawOutput = await callFn(prompt);

        const cleaned = stripMarkdownFences(rawOutput);

        if (!sanitizeOutput(cleaned)) continue;
        if (!cleaned.trim()) continue;

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.css.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.css.length, outputLength: cleaned.length });
        }

        const stats = computeStats(cleaned);

        const result: CssToTailwindResult = {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats,
          duration: Date.now() - startTime,
        };

        await setCache(cacheKey, {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats: { interfacesCreated: stats.rulesProcessed, typesAdded: stats.classesGenerated, anyCount: stats.unmappedProperties },
          duration: result.duration,
        }, 'tw');

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

function astOnlyFallback(request: CssToTailwindRequest, startTime: number): CssToTailwindResult {
  try {
    const astResult = cssToTailwindAst(request.css, request.options);
    return {
      convertedCode: astResult.code,
      provider: 'ast-only',
      fromCache: false,
      stats: astResult.stats,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '/* Could not parse CSS input */',
      provider: 'ast-only',
      fromCache: false,
      stats: { rulesProcessed: 0, classesGenerated: 0, arbitraryValuesUsed: 0, unmappedProperties: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(code: string): CssToTailwindStats {
  const selectorComments = code.match(/\/\*\s*\.[^*]+\*\//g);
  const rulesProcessed = selectorComments?.length || 0;

  // Count individual utility classes
  const lines = code.split('\n').filter(l => !l.startsWith('/*') && !l.startsWith('//') && l.trim());
  let classesGenerated = 0;
  let arbitraryValuesUsed = 0;
  for (const line of lines) {
    const classes = line.trim().split(/\s+/).filter(c => c && !c.startsWith('<') && !c.startsWith('{') && !c.startsWith('}') && !c.startsWith('@'));
    classesGenerated += classes.length;
    for (const cls of classes) {
      if (cls.includes('[') && cls.includes(']')) {
        arbitraryValuesUsed++;
      }
    }
  }

  return {
    rulesProcessed,
    classesGenerated,
    arbitraryValuesUsed,
    unmappedProperties: 0,
  };
}
