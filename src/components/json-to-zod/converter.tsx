'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { JsonToZodControlBar } from './control-bar';
import { JsonToZodConversionStats } from './conversion-stats';
import { useJsonPreview } from '@/hooks/use-json-preview';
import { useToolConversion } from '@/hooks/use-tool-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { DEFAULT_JSON_EXAMPLE } from '@/lib/constants';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import type { AIProvider, JsonToZodOptions, JsonToZodResult } from '@/lib/types';

export function JsonToZodConverter() {
  const [inputJson, setInputJson] = useState(DEFAULT_JSON_EXAMPLE);
  const [options, setOptions] = useState<JsonToZodOptions>({
    importStyle: 'import',
    addDescriptions: false,
    coerceDates: true,
    generateInferredType: true,
    schemaVariableName: 'schema',
  });
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');
  const [isScanning, setIsScanning] = useState(false);

  const stableOptions = useMemo(() => options, [
    options.importStyle,
    options.addDescriptions,
    options.coerceDates,
    options.generateInferredType,
    options.schemaVariableName,
  ]);

  const { preview } = useJsonPreview(inputJson, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useToolConversion<JsonToZodResult>(
    '/api/json-to-zod',
    'json',
  );

  const outputCode = result?.convertedCode || preview;

  const handleConvert = useCallback(() => {
    const provider = selectedProvider === 'auto' ? undefined : selectedProvider;
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert({ json: inputJson, options, preferredProvider: provider });
  }, [inputJson, options, selectedProvider, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';

  const statusText = computeStatusText(isConverting, result, selectedProvider);
  const statusState = computeStatusState(isConverting, result);

  return (
    <ConverterLayout
      inputValue={inputJson}
      onInputChange={setInputJson}
      outputValue={outputCode}
      inputLanguage="json"
      outputLanguage="typescript"
      inputFileType="JSON"
      outputFileType="ZOD"
      downloadFileName="schema.ts"
      emptyStateMessage="Zod schema will appear here"
      emptyStateHint="Paste JSON on the left, then hit Convert"
      isConverting={isConverting}
      error={error}
      isAstFallback={isAstOnly && !error}
      astFallbackMessage="AI models unavailable — showing basic schema. Smart validations and descriptions require AI."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={statusText}
      statusState={statusState}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <JsonToZodControlBar
          options={options}
          onOptionsChange={setOptions}
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? (
          <JsonToZodConversionStats result={result} fromCache={fromCache} />
        ) : null
      }
    />
  );
}
