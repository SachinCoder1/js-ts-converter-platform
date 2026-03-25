'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { JsonToTsOptions, JsonToTsStats } from '@/lib/types';

interface JsonToTsPreviewResult {
  preview: string;
  stats: JsonToTsStats | null;
  isProcessing: boolean;
  parseError: string | null;
}

export function useJsonToTsPreview(json: string, options: JsonToTsOptions): JsonToTsPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<JsonToTsStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!json.trim()) {
      setPreview('');
      setStats(null);
      setParseError(null);
      return;
    }

    setIsProcessing(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        JSON.parse(json);
        setParseError(null);

        const { jsonToTypeScript } = await import('@/lib/json-to-ts');
        const result = jsonToTypeScript(json, options);
        setPreview(result.code);
        setStats(result.stats);
      } catch (err) {
        if (err instanceof SyntaxError) {
          setParseError(err.message);
          setPreview('');
        } else {
          setPreview('');
        }
        setStats(null);
      } finally {
        setIsProcessing(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [json, options.outputStyle, options.exportKeyword, options.optionalFields, options.readonlyProperties, options.rootTypeName]);

  return { preview, stats, isProcessing, parseError };
}
