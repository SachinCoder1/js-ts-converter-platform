import 'server-only';
import type { ConversionRequest, ConversionResult, AIProvider, ConversionStats } from '../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../utils';
import { getFromCache, setCache } from './cache';
import { convertWithGemini } from './ai-providers/gemini';
import { convertWithDeepSeek } from './ai-providers/deepseek';
import { convertWithOpenRouter } from './ai-providers/openrouter';
import { astConvert } from '../ast';
import { parseTypeScript } from '../ast/parser';
import { logSecurityEvent } from '@/lib/server/security-logger';

type ProviderFn = (code: string, fileType: ConversionRequest['fileType']) => Promise<string>;

const providerMap: Record<Exclude<AIProvider, 'ast-only'>, ProviderFn> = {
  gemini: convertWithGemini,
  deepseek: convertWithDeepSeek,
  openrouter: convertWithOpenRouter,
};

const defaultChain: Exclude<AIProvider, 'ast-only'>[] = ['gemini', 'deepseek', 'openrouter'];

export async function convertCode(request: ConversionRequest): Promise<ConversionResult> {
  const startTime = Date.now();

  try {
    // Generate cache key
    const cacheKey = await hashCode(request.code, request.fileType);

    // Check cache
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        fromCache: true,
        duration: Date.now() - startTime,
      };
    }

    // Build fallback chain
    const chain = buildChain(request.preferredProvider);

    // Try each provider
    for (const providerName of chain) {
      try {
        const providerFn = providerMap[providerName];
        const rawOutput = await providerFn(request.code, request.fileType);

        // Clean and validate
        const cleaned = stripMarkdownFences(rawOutput);

        // Check for suspicious content
        if (!sanitizeOutput(cleaned)) {
          continue; // Try next provider
        }

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.code.length, cleaned.length)) {
          // Suspicious ratio — log but continue
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.code.length, outputLength: cleaned.length });
        }

        // Validate it parses as TypeScript
        const parseResult = parseTypeScript(cleaned);
        if (!parseResult.ast) {
          continue; // Try next provider
        }

        // Compute stats
        const stats = computeStats(cleaned);

        const result: ConversionResult = {
          convertedCode: cleaned,
          provider: providerName,
          fromCache: false,
          stats,
          duration: Date.now() - startTime,
        };

        // Cache the result
        await setCache(cacheKey, result);

        return result;
      } catch {
        // Provider failed, try next
        continue;
      }
    }

    // All AI providers failed — fall back to AST-only conversion
    return astOnlyFallback(request, startTime);
  } catch {
    // Absolute fallback
    return astOnlyFallback(request, startTime);
  }
}

function buildChain(preferred?: AIProvider): Exclude<AIProvider, 'ast-only'>[] {
  if (!preferred || preferred === 'ast-only') return defaultChain;
  // Put preferred provider first, then the rest
  const rest = defaultChain.filter(p => p !== preferred);
  return [preferred as Exclude<AIProvider, 'ast-only'>, ...rest];
}

function astOnlyFallback(request: ConversionRequest, startTime: number): ConversionResult {
  const astResult = astConvert(request.code, request.fileType);
  return {
    convertedCode: astResult.code,
    provider: 'ast-only',
    fromCache: false,
    stats: astResult.stats,
    duration: Date.now() - startTime,
  };
}

function computeStats(code: string): ConversionStats {
  // Count interfaces
  const interfaceMatches = code.match(/\binterface\s+\w+/g);
  const typeMatches = code.match(/\btype\s+\w+\s*=/g);
  const interfacesCreated = (interfaceMatches?.length || 0) + (typeMatches?.length || 0);

  // Count type annotations (: Type patterns, but not in strings)
  const typeAnnotations = code.match(/:\s*(?:string|number|boolean|void|null|undefined|unknown|never|React\.\w+|Array<|Promise<|\w+\[\]|\{[^}]*\}|\([^)]*\)\s*=>)/g);
  const typesAdded = typeAnnotations?.length || 0;

  // Count 'any' types
  const anyMatches = code.match(/:\s*any\b/g);
  const anyCount = anyMatches?.length || 0;

  return { interfacesCreated, typesAdded, anyCount };
}
