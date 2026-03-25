'use client';

import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '@/lib/constants';
import type { GraphqlToTsOptions, GraphqlToTsStats } from '@/lib/types';

interface GraphqlPreviewResult {
  preview: string;
  stats: GraphqlToTsStats | null;
  isProcessing: boolean;
}

export function useGraphqlPreview(graphql: string, options: GraphqlToTsOptions): GraphqlPreviewResult {
  const [preview, setPreview] = useState('');
  const [stats, setStats] = useState<GraphqlToTsStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!graphql.trim()) {
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
        const { graphqlToTsAst } = await import('@/lib/graphql-to-ts/ast-convert');
        const result = graphqlToTsAst(graphql, options);
        setPreview(result.code);
        setStats(result.stats);
      } catch {
        setPreview('// Invalid GraphQL schema');
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
  }, [graphql, options.enumStyle, options.nullableStyle, options.exportAll, options.readonlyProperties, options.rootTypeName]);

  return { preview, stats, isProcessing };
}
