import 'server-only';
import type { CurlToCodeRequest, CurlToCodeResult, AIProvider, CurlToCodeStats } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildCurlToCodePrompt } from './ai-prompt';
import type { PromptParts } from '../ai-prompt';
import { logSecurityEvent } from '@/lib/server/security-logger';
import { parseCurl } from '@/lib/curl-parser';
import { GENERATORS } from '@/lib/curl-to-code/generators';

type ProviderCallFn = (prompt: PromptParts) => Promise<string>;

const providerMap: Record<Exclude<AIProvider, 'ast-only'>, ProviderCallFn> = {
  gemini: callGemini,
  deepseek: callDeepSeek,
  openrouter: callOpenRouter,
};

const defaultChain: Exclude<AIProvider, 'ast-only'>[] = ['gemini', 'deepseek', 'openrouter'];

export async function convertCurlToCode(request: CurlToCodeRequest): Promise<CurlToCodeResult> {
  const startTime = Date.now();

  try {
    const cacheKey = await hashCode(request.curl, JSON.stringify(request.options));

    const cached = await getFromCache(cacheKey, 'curl');
    if (cached) {
      return {
        convertedCode: cached.convertedCode,
        provider: cached.provider,
        fromCache: true,
        stats: computeStats(request.curl),
        duration: Date.now() - startTime,
      };
    }

    if (request.preferredProvider === 'ast-only') {
      return ruleBasedFallback(request, startTime);
    }

    const prompt = buildCurlToCodePrompt(request.curl, request.options);
    const chain = buildChain(request.preferredProvider);

    for (const providerName of chain) {
      try {
        const callFn = providerMap[providerName];
        const rawOutput = await callFn(prompt);

        const cleaned = stripMarkdownFences(rawOutput);

        if (!sanitizeOutput(cleaned)) continue;
        if (!cleaned.trim()) continue;

        if (!checkOutputRatio(request.curl.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'curl-converter', { inputLength: request.curl.length, outputLength: cleaned.length });
        }

        const stats = computeStats(request.curl);

        const result: CurlToCodeResult = {
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
          stats: { interfacesCreated: stats.headersDetected, typesAdded: stats.flagsParsed, anyCount: 0 },
          duration: result.duration,
        }, 'curl');

        return result;
      } catch {
        continue;
      }
    }

    return ruleBasedFallback(request, startTime);
  } catch {
    return ruleBasedFallback(request, startTime);
  }
}

function buildChain(preferred?: AIProvider): Exclude<AIProvider, 'ast-only'>[] {
  if (!preferred || preferred === 'ast-only') return defaultChain;
  const rest = defaultChain.filter(p => p !== preferred);
  return [preferred as Exclude<AIProvider, 'ast-only'>, ...rest];
}

function ruleBasedFallback(request: CurlToCodeRequest, startTime: number): CurlToCodeResult {
  try {
    const parsed = parseCurl(request.curl);
    const generator = GENERATORS[request.options.targetLanguage];
    const code = generator.generate(parsed, {
      codeStyle: request.options.codeStyle,
      errorHandling: request.options.errorHandling,
      variableStyle: request.options.variableStyle,
    });

    return {
      convertedCode: code,
      provider: 'ast-only',
      fromCache: false,
      stats: computeStats(request.curl),
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '// Could not parse cURL command',
      provider: 'ast-only',
      fromCache: false,
      stats: { headersDetected: 0, methodDetected: 'GET', hasBody: false, hasAuth: false, flagsParsed: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(curl: string): CurlToCodeStats {
  try {
    const parsed = parseCurl(curl);
    return {
      headersDetected: Object.keys(parsed.headers).length,
      methodDetected: parsed.method,
      hasBody: parsed.body !== null || parsed.formData !== null,
      hasAuth: parsed.auth !== null,
      flagsParsed: Object.keys(parsed.headers).length +
        (parsed.body ? 1 : 0) +
        (parsed.auth ? 1 : 0) +
        (parsed.cookies ? 1 : 0) +
        (parsed.insecure ? 1 : 0) +
        (parsed.followRedirects ? 1 : 0) +
        (parsed.compressed ? 1 : 0) +
        (parsed.formData ? parsed.formData.length : 0),
    };
  } catch {
    return { headersDetected: 0, methodDetected: 'GET', hasBody: false, hasAuth: false, flagsParsed: 0 };
  }
}
