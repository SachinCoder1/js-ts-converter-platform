'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { SqlToTsControlBar } from './control-bar';
import { SqlToTsConversionStats } from './conversion-stats';
import { useSqlPreview } from '@/hooks/use-sql-preview';
import { useToolConversion } from '@/hooks/use-tool-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import { DEFAULT_SQL_EXAMPLE } from '@/lib/constants';
import type { SqlToTsOptions, SqlToTsResult } from '@/lib/types';

export function SqlToTsConverter() {
  const [inputSql, setInputSql] = useState(DEFAULT_SQL_EXAMPLE);
  const [options, setOptions] = useState<SqlToTsOptions>({
    dialect: 'postgresql',
    dateHandling: 'date-object',
    nullableStyle: 'union-null',
    outputFormat: 'interfaces',
    generateMode: 'select-only',
  });
  const [isScanning, setIsScanning] = useState(false);

  const stableOptions = useMemo(() => options, [
    options.dialect,
    options.dateHandling,
    options.nullableStyle,
    options.outputFormat,
    options.generateMode,
  ]);

  const { preview } = useSqlPreview(inputSql, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useToolConversion<SqlToTsResult>(
    '/api/sql-to-typescript',
    'sql',
  );

  const outputCode = result?.convertedCode || preview;

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert({ sql: inputSql, options });
  }, [inputSql, options, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';

  return (
    <ConverterLayout
      inputValue={inputSql}
      onInputChange={setInputSql}
      outputValue={outputCode}
      inputLanguage="sql"
      outputLanguage="typescript"
      inputFileType="SQL"
      outputFileType="TS"
      downloadFileName="types.ts"
      emptyStateMessage="TypeScript types will appear here"
      emptyStateHint="Paste SQL CREATE TABLE statements on the left, then hit Convert"
      isConverting={isConverting}
      error={error}
      isAstFallback={isAstOnly}
      astFallbackMessage="AI models unavailable  showing basic type mapping. Relation inference, Prisma/Drizzle output, and enhanced types require AI."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={computeStatusText(isConverting, result)}
      statusState={computeStatusState(isConverting, result)}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <SqlToTsControlBar
          options={options}
          onOptionsChange={setOptions}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <SqlToTsConversionStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
