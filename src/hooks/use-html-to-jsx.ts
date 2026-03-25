'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { HtmlToJsxOptions, HtmlToJsxStats } from '@/lib/html-to-jsx/types';

interface UseHtmlToJsxResult {
  output: string;
  warnings: string[];
  stats: HtmlToJsxStats | null;
  isProcessing: boolean;
}

export function useHtmlToJsx(
  htmlInput: string,
  options: HtmlToJsxOptions,
): UseHtmlToJsxResult {
  const [output, setOutput] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [stats, setStats] = useState<HtmlToJsxStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!htmlInput.trim()) {
      setOutput('');
      setWarnings([]);
      setStats(null);
      return;
    }

    setIsProcessing(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      try {
        const { convertHtmlToJsx } = await import('@/lib/html-to-jsx');
        const result = convertHtmlToJsx(htmlInput, options);
        setOutput(result.code);
        setWarnings(result.warnings);
        setStats(result.stats);
      } catch {
        setOutput(htmlInput);
        setWarnings([]);
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
  }, [htmlInput, options.outputFormat, options.componentWrapper, options.selfClosingStyle, options.quoteStyle]);

  return { output, warnings, stats, isProcessing };
}
