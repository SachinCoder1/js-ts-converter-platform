'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { SqlToTsOptions, SqlToTsStats } from '@/lib/types';

interface SqlPreviewResult {
  preview: string;
  stats: SqlToTsStats | null;
  isProcessing: boolean;
}

export function useSqlPreview(sql: string, options: SqlToTsOptions): SqlPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<SqlToTsStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sql.trim()) {
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
        const { sqlToTsAst } = await import('@/lib/sql-to-ts/ast-convert');
        const result = sqlToTsAst(sql, options);
        setPreview(result.code);
        setStats(result.stats);
      } catch {
        setPreview('// Invalid SQL schema');
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
  }, [sql, options.dialect, options.dateHandling, options.nullableStyle, options.outputFormat, options.generateMode]);

  return { preview, stats, isProcessing };
}
