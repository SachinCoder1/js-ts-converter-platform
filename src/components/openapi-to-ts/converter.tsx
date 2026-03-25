'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { OpenApiToTsControlBar } from './control-bar';
import { OpenApiToTsConversionStats } from './conversion-stats';
import { useOpenApiPreview } from '@/hooks/use-openapi-preview';
import { useToolConversion } from '@/hooks/use-tool-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import { DEFAULT_OPENAPI_EXAMPLE } from '@/lib/constants';
import type { AIProvider, OpenApiToTsOptions, OpenApiToTsResult } from '@/lib/types';

export function OpenApiToTsConverter() {
  const [inputSpec, setInputSpec] = useState(DEFAULT_OPENAPI_EXAMPLE);
  const [options, setOptions] = useState<OpenApiToTsOptions>({
    specVersion: 'auto',
    inputFormat: 'json',
    outputMode: 'interfaces-only',
    enumStyle: 'union',
    addJsDoc: true,
  });
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'auto'>('auto');
  const [isScanning, setIsScanning] = useState(false);

  const stableOptions = useMemo(() => options, [
    options.specVersion,
    options.inputFormat,
    options.outputMode,
    options.enumStyle,
    options.addJsDoc,
  ]);

  const { preview, parseError } = useOpenApiPreview(inputSpec, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useToolConversion<OpenApiToTsResult>(
    '/api/openapi-to-typescript',
    'spec',
  );

  const outputCode = result?.convertedCode || preview;

  const handleConvert = useCallback(() => {
    const provider = selectedProvider === 'auto' ? undefined : selectedProvider;
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert({ spec: inputSpec, options, preferredProvider: provider });
  }, [inputSpec, options, selectedProvider, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';
  const displayError = error || (parseError && !result ? parseError : null);

  const inputLanguage = options.inputFormat === 'yaml' ? 'yaml' : 'json';
  const inputFileType = options.inputFormat === 'yaml' ? 'YAML' : 'JSON';

  return (
    <ConverterLayout
      inputValue={inputSpec}
      onInputChange={setInputSpec}
      outputValue={outputCode}
      inputLanguage={inputLanguage}
      outputLanguage="typescript"
      inputFileType={inputFileType}
      outputFileType="TS"
      downloadFileName="types.ts"
      emptyStateMessage="TypeScript types will appear here"
      emptyStateHint="Paste an OpenAPI spec on the left, then hit Convert"
      isConverting={isConverting}
      error={displayError}
      isAstFallback={isAstOnly}
      astFallbackMessage="AI models unavailable — showing basic types. Complex $ref resolution and API client generation require AI."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={computeStatusText(isConverting, result, selectedProvider)}
      statusState={computeStatusState(isConverting, result)}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <OpenApiToTsControlBar
          options={options}
          onOptionsChange={setOptions}
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <OpenApiToTsConversionStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
