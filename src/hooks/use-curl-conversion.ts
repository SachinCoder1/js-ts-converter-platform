'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CurlToCodeResult, CurlToCodeOptions, AIProvider, CurlTargetLanguage } from '@/lib/types';
import { CONVERT_COOLDOWN_MS, MAX_CODE_SIZE } from '@/lib/constants';
import type { RateLimitInfo } from './use-tool-conversion';

interface UseCurlConversionResult {
  result: CurlToCodeResult | null;
  isConverting: boolean;
  error: string | null;
  fromCache: boolean;
  rateLimitInfo: RateLimitInfo;
  isRateLimited: boolean;
  convert: (curl: string, options: CurlToCodeOptions, provider?: AIProvider) => Promise<void>;
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
  const remaining = headers.get('X-RateLimit-Remaining');
  const limit = headers.get('X-RateLimit-Limit');
  const reset = headers.get('X-RateLimit-Reset');
  return {
    remaining: remaining !== null ? parseInt(remaining, 10) : null,
    limit: limit !== null ? parseInt(limit, 10) : null,
    resetAt: reset !== null ? Date.now() + parseInt(reset, 10) * 1000 : null,
  };
}

export function useCurlConversion(targetLanguage: CurlTargetLanguage): UseCurlConversionResult {
  const [result, setResult] = useState<CurlToCodeResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ remaining: null, limit: null, resetAt: null });
  const [isRateLimited, setIsRateLimited] = useState(false);
  const cooldownRef = useRef(false);
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
    };
  }, []);

  // Clear AI result when target language changes (old result was for a different language)
  useEffect(() => {
    setResult(null);
  }, [targetLanguage]);

  const convert = useCallback(async (curl: string, options: CurlToCodeOptions, provider?: AIProvider) => {
    if (cooldownRef.current || isRateLimited) return;
    if (!curl.trim()) {
      setError('Please enter a cURL command to convert.');
      return;
    }

    const inputSize = new TextEncoder().encode(curl).length;
    if (inputSize > MAX_CODE_SIZE) {
      setError('Input exceeds the maximum size of 50KB.');
      return;
    }

    setIsConverting(true);
    setError(null);

    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, CONVERT_COOLDOWN_MS);

    try {
      const response = await fetch('/api/curl-to-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SnipShift-Client': 'web' },
        body: JSON.stringify({ curl, options, preferredProvider: provider }),
      });

      const cacheHeader = response.headers.get('X-Cache');
      setFromCache(cacheHeader === 'HIT');
      setRateLimitInfo(parseRateLimitHeaders(response.headers));

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
          setIsRateLimited(true);
          setError(`Rate limit exceeded. Try again in ${retrySeconds}s.`);
          rateLimitTimerRef.current = setTimeout(() => {
            setIsRateLimited(false);
            setError(null);
          }, retrySeconds * 1000);
          return;
        }
        if (response.status === 413) {
          setError('Input exceeds the maximum size of 50KB.');
          return;
        }
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Conversion failed. Please try again.');
        return;
      }

      const data: CurlToCodeResult = await response.json();
      setResult(data);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsConverting(false);
    }
  }, [isRateLimited]);

  return { result, isConverting, error, fromCache, rateLimitInfo, isRateLimited, convert };
}
