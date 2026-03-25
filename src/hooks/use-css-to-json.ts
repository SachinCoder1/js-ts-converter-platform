'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { CssToJsonOptions } from '@/lib/css-to-json';

interface CssToJsonHookResult {
  output: string;
  ruleCount: number;
  propertyCount: number;
  duration: number;
  error: string | null;
  isProcessing: boolean;
}

export function useCssToJson(
  cssText: string,
  options: CssToJsonOptions
): CssToJsonHookResult {
  const [output, setOutput] = useState('');
  const [ruleCount, setRuleCount] = useState(0);
  const [propertyCount, setPropertyCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cssText.trim()) {
      setOutput('');
      setRuleCount(0);
      setPropertyCount(0);
      setDuration(0);
      setError(null);
      return;
    }

    setIsProcessing(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        const { cssToJson } = await import('@/lib/css-to-json');
        const result = cssToJson(cssText, options);
        setOutput(result.json);
        setRuleCount(result.ruleCount);
        setPropertyCount(result.propertyCount);
        setDuration(result.duration);
        setError(result.errors.length > 0 ? result.errors[0] : null);
      } catch (err) {
        setOutput('');
        setError(err instanceof Error ? err.message : 'Conversion failed');
      } finally {
        setIsProcessing(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [cssText, options.keyFormat, options.numericValues, options.wrapper]);

  return { output, ruleCount, propertyCount, duration, error, isProcessing };
}
