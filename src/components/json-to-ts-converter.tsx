'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { JsonToTsControlBar } from './json-to-ts-control-bar';
import { JsonToTsConversionStats } from './json-to-ts-conversion-stats';
import { useJsonToTsPreview } from '@/hooks/use-json-to-ts-preview';
import { useJsonToTsConversion } from '@/hooks/use-json-to-ts-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { DEFAULT_JSON_TO_TS_EXAMPLE, DEFAULT_JSON_TO_TS_OPTIONS } from '@/lib/constants';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import type { JsonToTsOptions } from '@/lib/types';

export function JsonToTsConverter() {
  const [inputJson, setInputJson] = useState(DEFAULT_JSON_TO_TS_EXAMPLE);
  const [options, setOptions] = useState<JsonToTsOptions>(DEFAULT_JSON_TO_TS_OPTIONS);
  const [isScanning, setIsScanning] = useState(false);

  // Memoize options to prevent excessive re-renders
  const memoizedOptions = useMemo(() => options, [
    options.outputStyle,
    options.exportKeyword,
    options.optionalFields,
    options.readonlyProperties,
    options.rootTypeName,
  ]);

  const { preview, parseError } = useJsonToTsPreview(inputJson, memoizedOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useJsonToTsConversion();

  const outputCode = result?.convertedCode || preview;

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert(inputJson, options);
  }, [inputJson, options, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';

  // Compute status bar text  JSON-to-TS uses "Generating" wording
  const statusText = isConverting
    ? 'Generating via AI...'
    : result
      ? `Generated in ${result.duration < 1000 ? result.duration + 'ms' : (result.duration / 1000).toFixed(1) + 's'}`
      : 'Ready';
  const statusState = computeStatusState(isConverting, result);

  // Build combined error for the layout
  const displayError = error || (parseError ? `JSON syntax error: ${parseError}` : null);

  return (
    <ConverterLayout
      inputValue={inputJson}
      onInputChange={setInputJson}
      outputValue={outputCode}
      inputLanguage="json"
      outputLanguage="typescript"
      inputFileType="JSON"
      outputFileType="TS"
      downloadFileName="types.ts"
      isConverting={isConverting}
      error={displayError}
      isAstFallback={isAstOnly && !error && !parseError}
      astFallbackMessage="AI models unavailable  showing basic interface generation. Names may need manual refinement."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={statusText}
      statusState={statusState}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <JsonToTsControlBar
          options={options}
          onOptionsChange={setOptions}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? (
          <JsonToTsConversionStats result={result} fromCache={fromCache} />
        ) : null
      }
    />
  );
}
