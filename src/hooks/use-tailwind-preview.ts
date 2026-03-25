'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { TailwindConversionOptions, TailwindConversionStats } from '@/lib/tailwind-types';

interface TailwindPreviewResult {
  preview: string;
  stats: TailwindConversionStats | null;
  isProcessing: boolean;
}

export function useTailwindPreview(input: string, options: TailwindConversionOptions): TailwindPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<TailwindConversionStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!input.trim()) {
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
        const { convertTailwindToCSS } = await import('@/lib/tailwind');
        const result = convertTailwindToCSS(input, options);

        // Count unknown classes
        const allClasses = input.split(/\s+/).filter(Boolean);
        const unknownCount = allClasses.length - result.stats.classesConverted;

        setPreview(result.css);
        setStats({ ...result.stats, unknownClasses: Math.max(0, unknownCount) });
      } catch {
        setPreview('');
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
  }, [input, options]);

  return { preview, stats, isProcessing };
}
