'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ConversionResult, FileType, AIProvider } from '@/lib/types';
import { CONVERT_COOLDOWN_MS, MAX_CODE_SIZE } from '@/lib/constants';

export interface RateLimitInfo {
  remaining: number | null;
  limit: number | null;
  resetAt: number | null;
}

interface UseConversionResult {
  result: ConversionResult | null;
  isConverting: boolean;
  error: string | null;
  fromCache: boolean;
  rateLimitInfo: RateLimitInfo;
  isRateLimited: boolean;
  convert: (code: string, fileType: FileType, provider?: AIProvider) => Promise<void>;
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

export function useConversion(): UseConversionResult {
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ remaining: null, limit: null, resetAt: null });
  const [isRateLimited, setIsRateLimited] = useState(false);
  const cooldownRef = useRef(false);
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup rate limit timer on unmount
  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
    };
  }, []);

  const convert = useCallback(async (code: string, fileType: FileType, provider?: AIProvider) => {
    if (cooldownRef.current || isRateLimited) return;
    if (!code.trim()) {
      setError('Please enter some code to convert.');
      return;
    }

    const codeSize = new TextEncoder().encode(code).length;
    if (codeSize > MAX_CODE_SIZE) {
      setError('Code exceeds the maximum size of 50KB.');
      return;
    }

    setIsConverting(true);
    setError(null);

    // Cooldown to prevent double-submit
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, CONVERT_COOLDOWN_MS);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SnipShift-Client': 'web' },
        body: JSON.stringify({ code, fileType, preferredProvider: provider }),
      });

      const cacheHeader = response.headers.get('X-Cache');
      setFromCache(cacheHeader === 'HIT');

      // Parse rate limit headers from every response
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
          setError('Code exceeds the maximum size of 50KB.');
          return;
        }
        setError('Conversion failed. Please try again.');
        return;
      }

      const data: ConversionResult = await response.json();
      setResult(data);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsConverting(false);
    }
  }, [isRateLimited]);

  return { result, isConverting, error, fromCache, rateLimitInfo, isRateLimited, convert };
}
