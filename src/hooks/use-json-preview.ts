'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { JsonToZodOptions, JsonToZodStats } from '@/lib/types';

interface JsonPreviewResult {
  preview: string;
  stats: JsonToZodStats | null;
  isProcessing: boolean;
}

export function useJsonPreview(json: string, options: JsonToZodOptions): JsonPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<JsonToZodStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!json.trim()) {
      setPreview('');
      setStats(null);
      return;
    }

    setIsProcessing(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        const { jsonToZodAst } = await import('@/lib/server/json-to-zod/ast-convert');
        const result = jsonToZodAst(json, options);
        setPreview(result.code);
        setStats(result.stats);
      } catch {
        setPreview('// Invalid JSON');
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
  }, [json, options.importStyle, options.coerceDates, options.generateInferredType, options.schemaVariableName, options.addDescriptions]);

  return { preview, stats, isProcessing };
}
