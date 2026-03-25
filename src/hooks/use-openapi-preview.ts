'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { OpenApiToTsOptions, OpenApiToTsStats } from '@/lib/types';

interface OpenApiPreviewResult {
  preview: string;
  stats: OpenApiToTsStats | null;
  isProcessing: boolean;
  parseError: string | null;
}

export function useOpenApiPreview(spec: string, options: OpenApiToTsOptions): OpenApiPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<OpenApiToTsStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!spec.trim()) {
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
        const { openApiToTsAst } = await import('@/lib/openapi-to-ts/ast-convert');
        const result = openApiToTsAst(spec, options);
        setPreview(result.code);
        setStats(result.stats);
        setParseError(null);
      } catch (err) {
        setPreview('');
        setStats(null);
        setParseError(err instanceof Error ? err.message : 'Invalid spec');
      } finally {
        setIsProcessing(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [spec, options.specVersion, options.inputFormat, options.outputMode, options.enumStyle, options.addJsDoc]);

  return { preview, stats, isProcessing, parseError };
}
