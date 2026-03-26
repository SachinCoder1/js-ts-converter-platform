'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CONVERT_COOLDOWN_MS } from '@/lib/constants';
import type { AIProvider, RegexFlavor, RegexExplainResult, RegexConvertResult } from '@/lib/types';

interface RateLimitInfo {
  remaining: number | null;
  limit: number | null;
}

interface UseRegexAiResult {
  explainResult: RegexExplainResult | null;
  convertResult: RegexConvertResult | null;
  isExplaining: boolean;
  isConverting: boolean;
  explainError: string | null;
  convertError: string | null;
  rateLimitInfo: RateLimitInfo;
  isRateLimited: boolean;
  explain: (pattern: string, flags: string, sourceFlavor: RegexFlavor, provider?: AIProvider) => Promise<void>;
  convertRegex: (pattern: string, flags: string, sourceFlavor: RegexFlavor, targetFlavors: RegexFlavor[], provider?: AIProvider) => Promise<void>;
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
  const remaining = headers.get('X-RateLimit-Remaining');
  const limit = headers.get('X-RateLimit-Limit');
  return {
    remaining: remaining !== null ? parseInt(remaining, 10) : null,
    limit: limit !== null ? parseInt(limit, 10) : null,
  };
}

export function useRegexAi(): UseRegexAiResult {
  const [explainResult, setExplainResult] = useState<RegexExplainResult | null>(null);
  const [convertResult, setConvertResult] = useState<RegexConvertResult | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ remaining: null, limit: null });
  const [isRateLimited, setIsRateLimited] = useState(false);
  const cooldownRef = useRef(false);
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
    };
  }, []);

  const handleRateLimit = useCallback((response: Response, setError: (e: string) => void) => {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      setIsRateLimited(true);
      setError(`Rate limit exceeded. Try again in ${retrySeconds}s.`);
      rateLimitTimerRef.current = setTimeout(() => {
        setIsRateLimited(false);
      }, retrySeconds * 1000);
      return true;
    }
    return false;
  }, []);

  const explain = useCallback(async (
    pattern: string,
    flags: string,
    sourceFlavor: RegexFlavor,
    provider?: AIProvider,
  ) => {
    if (cooldownRef.current || isRateLimited) return;
    if (!pattern.trim()) {
      setExplainError('Please enter a regex pattern.');
      return;
    }

    setIsExplaining(true);
    setExplainError(null);
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, CONVERT_COOLDOWN_MS);

    try {
      const response = await fetch('/api/regex-tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SnipShift-Client': 'web' },
        body: JSON.stringify({
          action: 'explain',
          pattern,
          flags,
          sourceFlavor,
          preferredProvider: provider,
        }),
      });

      setRateLimitInfo(parseRateLimitHeaders(response.headers));
      if (handleRateLimit(response, setExplainError)) return;

      if (!response.ok) {
        setExplainError('Failed to generate explanation. Please try again.');
        return;
      }

      const data: RegexExplainResult = await response.json();
      setExplainResult(data);
    } catch {
      setExplainError('Network error. Please check your connection and try again.');
    } finally {
      setIsExplaining(false);
    }
  }, [isRateLimited, handleRateLimit]);

  const convertRegex = useCallback(async (
    pattern: string,
    flags: string,
    sourceFlavor: RegexFlavor,
    targetFlavors: RegexFlavor[],
    provider?: AIProvider,
  ) => {
    if (cooldownRef.current || isRateLimited) return;
    if (!pattern.trim()) {
      setConvertError('Please enter a regex pattern.');
      return;
    }

    setIsConverting(true);
    setConvertError(null);
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, CONVERT_COOLDOWN_MS);

    try {
      const response = await fetch('/api/regex-tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SnipShift-Client': 'web' },
        body: JSON.stringify({
          action: 'convert',
          pattern,
          flags,
          sourceFlavor,
          targetFlavors,
          preferredProvider: provider,
        }),
      });

      setRateLimitInfo(parseRateLimitHeaders(response.headers));
      if (handleRateLimit(response, setConvertError)) return;

      if (!response.ok) {
        setConvertError('Failed to convert regex. Please try again.');
        return;
      }

      const data: RegexConvertResult = await response.json();
      setConvertResult(data);
    } catch {
      setConvertError('Network error. Please check your connection and try again.');
    } finally {
      setIsConverting(false);
    }
  }, [isRateLimited, handleRateLimit]);

  return {
    explainResult,
    convertResult,
    isExplaining,
    isConverting,
    explainError,
    convertError,
    rateLimitInfo,
    isRateLimited,
    explain,
    convertRegex,
  };
}
