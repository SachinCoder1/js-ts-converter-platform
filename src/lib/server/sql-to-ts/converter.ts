import 'server-only';
import type { SqlToTsRequest, SqlToTsResult, AIProvider, SqlToTsStats } from '../../types';
import { hashCode, stripMarkdownFences, sanitizeOutput, checkOutputRatio } from '../../utils';
import { getFromCache, setCache } from '../cache';
import { callGemini } from '../ai-providers/gemini';
import { callDeepSeek } from '../ai-providers/deepseek';
import { callOpenRouter } from '../ai-providers/openrouter';
import { buildSqlToTsPrompt } from '../../sql-to-ts/ai-prompt';
import { sqlToTsAst } from '../../sql-to-ts/ast-convert';
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

export async function convertSqlToTs(request: SqlToTsRequest): Promise<SqlToTsResult> {
  const startTime = Date.now();

  try {
    const cacheKey = await hashCode(request.sql, JSON.stringify(request.options));

    // Check cache
    const cached = await getFromCache(cacheKey, 'sql-ts');
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
    const prompt = buildSqlToTsPrompt(request.sql, request.options);
    const chain = buildChain(request.preferredProvider);

    // Try each provider
    for (const providerName of chain) {
      try {
        const callFn = providerMap[providerName];
        const rawOutput = await callFn(prompt);

        const cleaned = stripMarkdownFences(rawOutput);

        if (!sanitizeOutput(cleaned)) continue;

        // Flag suspicious output ratio (but don't reject)
        if (!checkOutputRatio(request.sql.length, cleaned.length)) {
          logSecurityEvent('output_ratio_flag', 'converter', { inputLength: request.sql.length, outputLength: cleaned.length });
        }

        // For TS interface output, validate it parses as TypeScript
        if (request.options.outputFormat === 'interfaces') {
          const parseResult = parseTypeScript(cleaned);
          if (!parseResult.ast) continue;
        }

        const stats = computeStats(cleaned);

        const result: SqlToTsResult = {
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
          stats: { interfacesCreated: stats.tablesConverted, typesAdded: stats.columnsTyped, anyCount: 0 },
          duration: result.duration,
        }, 'sql-ts');

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

function astOnlyFallback(request: SqlToTsRequest, startTime: number): SqlToTsResult {
  try {
    const astResult = sqlToTsAst(request.sql, request.options);
    return {
      convertedCode: astResult.code,
      provider: 'ast-only',
      fromCache: false,
      stats: astResult.stats,
      duration: Date.now() - startTime,
    };
  } catch {
    return {
      convertedCode: '// Failed to parse SQL schema',
      provider: 'ast-only',
      fromCache: false,
      stats: { tablesConverted: 0, columnsTyped: 0, foreignKeysDetected: 0, enumsGenerated: 0 },
      duration: Date.now() - startTime,
    };
  }
}

function computeStats(code: string): SqlToTsStats {
  const interfaceMatches = code.match(/\binterface\s+\w+/g);
  const typeMatches = code.match(/\btype\s+\w+/g);
  const fieldMatches = code.match(/^\s+(?:readonly\s+)?\w+[?]?\s*:/gm);
  const fkComments = code.match(/\/\/.*(?:references|foreign|relation|FK)/gi);
  const enumLike = code.match(/:\s*'[^']+'\s*\|/g);

  return {
    tablesConverted: (interfaceMatches?.length || 0) + (typeMatches?.length || 0),
    columnsTyped: fieldMatches?.length || 0,
    foreignKeysDetected: fkComments?.length || 0,
    enumsGenerated: enumLike?.length || 0,
  };
}
