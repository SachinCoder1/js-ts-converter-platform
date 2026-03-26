import 'server-only';
import type { AIProvider, RegexFlavor, RegexExplainResult, RegexConvertResult, RegexConversionEntry } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callOpenAI } from '../ai-providers/openai';
import { callKimi } from '../ai-providers/kimi';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildRegexExplainPrompt, buildRegexConvertPrompt } from './ai-prompt';
import type { PromptParts } from '../ai-prompt';

type ProviderCallFn = (prompt: PromptParts) => Promise<string>;

const providerMap: Record<Exclude<AIProvider, 'ast-only'>, ProviderCallFn> = {
  gemini: callGemini,
  openai: callOpenAI,
  kimi: callKimi,
  deepseek: callDeepSeek,
  openrouter: callOpenRouter,
};

const defaultChain: Exclude<AIProvider, 'ast-only'>[] = ['gemini', 'openai', 'kimi', 'deepseek', 'openrouter'];

function buildChain(preferred?: AIProvider): Exclude<AIProvider, 'ast-only'>[] {
  if (!preferred || preferred === 'ast-only') return defaultChain;
  const rest = defaultChain.filter(p => p !== preferred);
  return [preferred as Exclude<AIProvider, 'ast-only'>, ...rest];
}

export async function handleRegexExplain(
  pattern: string,
  flags: string,
  sourceFlavor: RegexFlavor,
  preferredProvider?: AIProvider,
): Promise<RegexExplainResult> {
  const startTime = Date.now();

  const cacheKey = await hashCode(pattern, `explain:${flags}:${sourceFlavor}`);
  const cached = await getFromCache(cacheKey, 'regex-explain');
  if (cached) {
    return {
      explanation: cached.convertedCode,
      provider: cached.provider,
      fromCache: true,
      duration: Date.now() - startTime,
    };
  }

  const prompt = buildRegexExplainPrompt(pattern, flags, sourceFlavor);
  const chain = buildChain(preferredProvider);

  for (const providerName of chain) {
    try {
      const callFn = providerMap[providerName];
      const rawOutput = await callFn(prompt);
      const cleaned = stripMarkdownFences(rawOutput).trim();

      if (!cleaned || !sanitizeOutput(cleaned)) continue;

      await setCache(cacheKey, {
        convertedCode: cleaned,
        provider: providerName,
        fromCache: false,
        stats: { interfacesCreated: 0, typesAdded: 0, anyCount: 0 },
        duration: Date.now() - startTime,
      }, 'regex-explain');

      return {
        explanation: cleaned,
        provider: providerName,
        fromCache: false,
        duration: Date.now() - startTime,
      };
    } catch {
      continue;
    }
  }

  return {
    explanation: 'Unable to generate explanation. All AI providers are currently unavailable.',
    provider: 'ast-only',
    fromCache: false,
    duration: Date.now() - startTime,
  };
}

export async function handleRegexConvert(
  pattern: string,
  flags: string,
  sourceFlavor: RegexFlavor,
  targetFlavors: RegexFlavor[],
  preferredProvider?: AIProvider,
): Promise<RegexConvertResult> {
  const startTime = Date.now();

  const cacheKey = await hashCode(pattern, `convert:${flags}:${sourceFlavor}:${targetFlavors.sort().join(',')}`);
  const cached = await getFromCache(cacheKey, 'regex-convert');
  if (cached) {
    try {
      const conversions: RegexConversionEntry[] = JSON.parse(cached.convertedCode);
      return {
        conversions,
        provider: cached.provider,
        fromCache: true,
        duration: Date.now() - startTime,
      };
    } catch {
      // Cache had invalid data, proceed with fresh conversion
    }
  }

  const prompt = buildRegexConvertPrompt(pattern, flags, sourceFlavor, targetFlavors);
  const chain = buildChain(preferredProvider);

  for (const providerName of chain) {
    try {
      const callFn = providerMap[providerName];
      const rawOutput = await callFn(prompt);
      const cleaned = stripMarkdownFences(rawOutput).trim();

      if (!cleaned || !sanitizeOutput(cleaned)) continue;

      const conversions = parseConversions(cleaned, targetFlavors);
      if (!conversions) continue;

      await setCache(cacheKey, {
        convertedCode: JSON.stringify(conversions),
        provider: providerName,
        fromCache: false,
        stats: { interfacesCreated: 0, typesAdded: 0, anyCount: 0 },
        duration: Date.now() - startTime,
      }, 'regex-convert');

      return {
        conversions,
        provider: providerName,
        fromCache: false,
        duration: Date.now() - startTime,
      };
    } catch {
      continue;
    }
  }

  return {
    conversions: [],
    provider: 'ast-only',
    fromCache: false,
    duration: Date.now() - startTime,
  };
}

function parseConversions(raw: string, targetFlavors: RegexFlavor[]): RegexConversionEntry[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const validFlavors = new Set<string>(targetFlavors);
    const result: RegexConversionEntry[] = [];

    for (const entry of parsed) {
      if (
        typeof entry === 'object' &&
        entry !== null &&
        typeof entry.flavor === 'string' &&
        typeof entry.pattern === 'string' &&
        typeof entry.flags === 'string' &&
        typeof entry.notes === 'string' &&
        validFlavors.has(entry.flavor)
      ) {
        result.push({
          flavor: entry.flavor as RegexFlavor,
          pattern: entry.pattern,
          flags: entry.flags,
          notes: entry.notes,
        });
      }
    }

    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}
