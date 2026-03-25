import 'server-only';
import type { AIProvider } from '../../types';
import type { TailwindConversionRequest, TailwindConversionResult, TailwindConversionStats } from '../../tailwind-types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { buildTailwindPrompt } from './ai-prompt';
import { callTailwindGemini, callTailwindDeepSeek, callTailwindOpenRouter } from './ai-providers';
import { convertTailwindToCSS } from '../../tailwind';
import { logSecurityEvent } from '@/lib/server/security-logger';

type ProviderFn = (prompt: { system: string; user: string; delimiter: string }) => Promise<string>;

const providerMap: Record<Exclude<AIProvider, 'ast-only'>, ProviderFn> = {
  gemini: callTailwindGemini,
  deepseek: callTailwindDeepSeek,
  openrouter: callTailwindOpenRouter,
};

const defaultChain: Exclude<AIProvider, 'ast-only'>[] = ['gemini', 'deepseek', 'openrouter'];

export async function convertTailwind(request: TailwindConversionRequest): Promise<TailwindConversionResult> {
  const startTime = Date.now();

  try {
    // Generate cache key incorporating options
    const optionsKey = JSON.stringify(request.options);
    const cacheKey = await hashCode(request.input + optionsKey, 'tw');

    // Check cache (reuses existing cache with 'tw' prefix)
    const cached = await getFromCache(cacheKey, 'tw');
    if (cached) {
      return {
        convertedCss: cached.convertedCode,
        provider: cached.provider,
        fromCache: true,
        stats: mapCacheStats(cached.stats),
        duration: Date.now() - startTime,
      };
    }

    // Build fallback chain
    const chain = buildChain(request.preferredProvider);

    // Build prompt
    const prompt = buildTailwindPrompt(request.input, request.options);

    // Try each AI provider
    for (const providerName of chain) {
      try {
        const providerFn = providerMap[providerName];
        const rawOutput = await providerFn(prompt);

        // Clean markdown fences
        const cleaned = stripMarkdownFences(rawOutput);

        // Check for suspicious content
        if (!sanitizeOutput(cleaned)) continue;

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.input.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.input.length, outputLength: cleaned.length });
        }

        // Validate it looks like CSS (basic check)
        if (!isValidCSS(cleaned)) continue;

        // Compute stats
        const stats = computeStats(cleaned, request.input);

        const result: TailwindConversionResult = {
          convertedCss: cleaned,
          provider: providerName,
          fromCache: false,
          stats,
          duration: Date.now() - startTime,
        };

        // Cache the result (store as ConversionResult shape for compatibility)
        await setCache(cacheKey, {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats: { interfacesCreated: stats.classesConverted, typesAdded: stats.propertiesGenerated, anyCount: stats.unknownClasses },
          duration: result.duration,
        }, 'tw');

        return result;
      } catch {
        continue;
      }
    }

    // All AI providers failed — fall back to rule-based conversion
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

function ruleBasedFallback(request: TailwindConversionRequest, startTime: number): TailwindConversionResult {
  const result = convertTailwindToCSS(request.input, request.options);

  // Count unknown classes
  const allClasses = request.input.split(/\s+/).filter(Boolean);
  const unknownCount = allClasses.length - result.stats.classesConverted;

  return {
    convertedCss: result.css,
    provider: 'ast-only',
    fromCache: false,
    stats: { ...result.stats, unknownClasses: Math.max(0, unknownCount) },
    duration: Date.now() - startTime,
  };
}

function isValidCSS(text: string): boolean {
  if (!text.trim()) return false;
  // Check balanced braces
  let depth = 0;
  for (const ch of text) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth < 0) return false;
  }
  if (depth !== 0) return false;
  // Must contain at least one property
  return /[\w-]+\s*:\s*[^;]+/.test(text);
}

function computeStats(css: string, input: string): TailwindConversionStats {
  const inputClasses = input.split(/\s+/).filter(Boolean);
  const propertyMatches = css.match(/[\w-]+\s*:\s*[^;{]+;/g);
  const mediaMatches = css.match(/@media\s+/g);
  const pseudoMatches = css.match(/\.([\w-]+):[:\w-]+\s*\{/g);

  return {
    classesConverted: inputClasses.length,
    propertiesGenerated: propertyMatches?.length || 0,
    mediaQueries: mediaMatches?.length || 0,
    pseudoSelectors: pseudoMatches?.length || 0,
    unknownClasses: 0,
  };
}

function mapCacheStats(stats: { interfacesCreated: number; typesAdded: number; anyCount: number }): TailwindConversionStats {
  return {
    classesConverted: stats.interfacesCreated,
    propertiesGenerated: stats.typesAdded,
    mediaQueries: 0,
    pseudoSelectors: 0,
    unknownClasses: stats.anyCount,
  };
}
