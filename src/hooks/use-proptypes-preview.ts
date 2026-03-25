'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { PropTypesToTsOptions, PropTypesToTsStats } from '@/lib/types';

interface PropTypesPreviewResult {
  preview: string;
  stats: PropTypesToTsStats | null;
  isProcessing: boolean;
}

export function usePropTypesPreview(code: string, options: PropTypesToTsOptions): PropTypesPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<PropTypesToTsStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!code.trim()) {
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
        const { propTypesToTsAst } = await import('@/lib/server/proptypes-to-ts/ast-convert');
        const result = propTypesToTsAst(code, options);
        setPreview(result.code);
        setStats(result.stats);
      } catch {
        setPreview('// Could not parse PropTypes');
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
  }, [code, options.outputMode, options.defaultPropsHandling, options.functionTypes]);

  return { preview, stats, isProcessing };
}
