'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { CssToTailwindOptions, CssToTailwindStats } from '@/lib/types';

interface CssPreviewResult {
  preview: string;
  stats: CssToTailwindStats | null;
  isProcessing: boolean;
}

export function useCssPreview(css: string, options: CssToTailwindOptions): CssPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<CssToTailwindStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!css.trim()) {
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
        const { cssToTailwindAst } = await import('@/lib/server/css-to-tailwind/ast-convert');
        const result = cssToTailwindAst(css, options);
        setPreview(result.code);
        setStats(result.stats);
      } catch {
        setPreview('/* Could not parse CSS */');
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
  }, [css, options.tailwindVersion, options.arbitraryValues, options.outputFormat, options.prefix, options.colorFormat]);

  return { preview, stats, isProcessing };
}
