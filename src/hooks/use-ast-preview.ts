'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { FileType, ConversionStats } from '@/lib/types';

interface ASTPreviewResult {
  preview: string;
  stats: ConversionStats | null;
  isProcessing: boolean;
}

export function useAstPreview(code: string, fileType: FileType): ASTPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<ConversionStats | null>(null);
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
        // Dynamic import to keep bundle small on initial load
        const { astConvert } = await import('@/lib/ast');
        const result = astConvert(code, fileType);
        setPreview(result.code);
        setStats(result.stats);
      } catch {
        setPreview(code);
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
  }, [code, fileType]);

  return { preview, stats, isProcessing };
}
