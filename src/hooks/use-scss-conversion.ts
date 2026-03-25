'use client';

import { useState, useCallback, useRef } from 'react';
import type { ScssConversionResult, ScssSyntax, ScssOutputStyle } from '@/lib/types';
import { CONVERT_COOLDOWN_MS, MAX_CODE_SIZE } from '@/lib/constants';

interface UseScssConversionReturn {
  result: ScssConversionResult | null;
  isConverting: boolean;
  error: string | null;
  convert: (code: string, syntax: ScssSyntax, outputStyle: ScssOutputStyle) => Promise<void>;
}

export function useScssConversion(): UseScssConversionReturn {
  const [result, setResult] = useState<ScssConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldownRef = useRef(false);

  const convert = useCallback(
    async (code: string, syntax: ScssSyntax, outputStyle: ScssOutputStyle) => {
      if (cooldownRef.current) return;
      if (!code.trim()) {
        setError('Please enter some SCSS/SASS code to compile.');
        return;
      }

      const codeSize = new TextEncoder().encode(code).length;
      if (codeSize > MAX_CODE_SIZE) {
        setError('Code exceeds the maximum size of 50KB.');
        return;
      }

      setIsConverting(true);
      setError(null);

      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, CONVERT_COOLDOWN_MS);

      try {
        const response = await fetch('/api/convert/scss-to-css', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, syntax, outputStyle }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            setError(
              `Rate limit exceeded. Please wait ${retryAfter || 'a moment'} and try again.`
            );
            return;
          }
          if (response.status === 413) {
            setError('Code exceeds the maximum size of 50KB.');
            return;
          }
          if (response.status === 422) {
            const data = await response.json();
            setError(data.error || 'SCSS compilation failed.');
            return;
          }
          setError('Compilation failed. Please try again.');
          return;
        }

        const data: ScssConversionResult = await response.json();
        setResult(data);
      } catch {
        setError('Network error. Please check your connection and try again.');
      } finally {
        setIsConverting(false);
      }
    },
    []
  );

  return { result, isConverting, error, convert };
}
