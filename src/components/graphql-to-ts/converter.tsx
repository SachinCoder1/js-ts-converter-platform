'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { GraphqlToTsControlBar } from './control-bar';
import { GraphqlToTsConversionStats } from './conversion-stats';
import { useGraphqlPreview } from '@/hooks/use-graphql-preview';
import { useToolConversion } from '@/hooks/use-tool-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import { DEFAULT_GRAPHQL_EXAMPLE } from '@/lib/constants';
import type { GraphqlToTsOptions, GraphqlToTsResult } from '@/lib/types';

export function GraphqlToTsConverter() {
  const [inputGraphql, setInputGraphql] = useState(DEFAULT_GRAPHQL_EXAMPLE);
  const [options, setOptions] = useState<GraphqlToTsOptions>({
    enumStyle: 'enum',
    nullableStyle: 'null',
    exportAll: true,
    readonlyProperties: false,
    rootTypeName: 'Root',
  });
  const [isScanning, setIsScanning] = useState(false);

  const stableOptions = useMemo(() => options, [
    options.enumStyle,
    options.nullableStyle,
    options.exportAll,
    options.readonlyProperties,
    options.rootTypeName,
  ]);

  const { preview } = useGraphqlPreview(inputGraphql, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useToolConversion<GraphqlToTsResult>(
    '/api/graphql-to-typescript',
    'graphql',
  );

  const outputCode = result?.convertedCode || preview;

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert({ graphql: inputGraphql, options });
  }, [inputGraphql, options, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';

  return (
    <ConverterLayout
      inputValue={inputGraphql}
      onInputChange={setInputGraphql}
      outputValue={outputCode}
      inputLanguage="graphql"
      outputLanguage="typescript"
      inputFileType="GQL"
      outputFileType="TS"
      downloadFileName="types.ts"
      emptyStateMessage="TypeScript types will appear here"
      emptyStateHint="Paste a GraphQL schema on the left, then hit Convert"
      isConverting={isConverting}
      error={error}
      isAstFallback={isAstOnly}
      astFallbackMessage="AI models unavailable  showing basic types. Smart scalar mapping and enhanced types require AI."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={computeStatusText(isConverting, result)}
      statusState={computeStatusState(isConverting, result)}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <GraphqlToTsControlBar
          options={options}
          onOptionsChange={setOptions}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <GraphqlToTsConversionStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
