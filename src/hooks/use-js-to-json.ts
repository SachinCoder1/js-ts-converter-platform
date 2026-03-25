'use client';

import { useState, useEffect, useRef } from 'react';
import { JS_TO_JSON_DEBOUNCE_MS } from '@/lib/js-to-json/constants';
import type { JsToJsonOptions, JsToJsonResult } from '@/lib/js-to-json/types';

const EMPTY_RESULT: JsToJsonResult = {
  json: '',
  error: null,
  errorLine: null,
  stats: { keysRemoved: 0, commentsStripped: 0, specialValuesConverted: 0 },
  duration: 0,
};

export function useJsToJson(
  input: string,
  options: JsToJsonOptions
): JsToJsonResult & { isProcessing: boolean } {
  const [result, setResult] = useState<JsToJsonResult>(EMPTY_RESULT);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setResult(EMPTY_RESULT);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        const { convertJsObjectToJson } = await import('@/lib/js-to-json/converter');
        const conversionResult = convertJsObjectToJson(input, options);
        setResult(conversionResult);
      } catch (err) {
        setResult({
          json: '',
          error: err instanceof Error ? err.message : 'Conversion failed',
          errorLine: null,
          stats: { keysRemoved: 0, commentsStripped: 0, specialValuesConverted: 0 },
          duration: 0,
        });
      } finally {
        setIsProcessing(false);
      }
    }, JS_TO_JSON_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [input, options.indent, options.undefinedHandling, options.sortKeys]);

  return { ...result, isProcessing };
}
