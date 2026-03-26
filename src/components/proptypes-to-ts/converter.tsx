'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { PropTypesToTsControlBar } from './control-bar';
import { PropTypesToTsConversionStats } from './conversion-stats';
import { usePropTypesPreview } from '@/hooks/use-proptypes-preview';
import { useToolConversion } from '@/hooks/use-tool-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import { DEFAULT_PROPTYPES_EXAMPLE } from '@/lib/constants';
import type { PropTypesToTsOptions, PropTypesToTsResult } from '@/lib/types';

export function PropTypesToTsConverter() {
  const [inputCode, setInputCode] = useState(DEFAULT_PROPTYPES_EXAMPLE);
  const [options, setOptions] = useState<PropTypesToTsOptions>({
    outputMode: 'interface-only',
    defaultPropsHandling: 'merge-optional',
    functionTypes: 'event-inference',
  });
  const [isScanning, setIsScanning] = useState(false);

  const stableOptions = useMemo(() => options, [
    options.outputMode,
    options.defaultPropsHandling,
    options.functionTypes,
  ]);

  const { preview } = usePropTypesPreview(inputCode, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useToolConversion<PropTypesToTsResult>(
    '/api/proptypes-to-ts',
    'code',
  );

  const outputCode = result?.convertedCode || preview;

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert({ code: inputCode, options });
  }, [inputCode, options, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';

  return (
    <ConverterLayout
      inputValue={inputCode}
      onInputChange={setInputCode}
      outputValue={outputCode}
      inputLanguage="javascript"
      outputLanguage="typescript"
      inputFileType="JSX"
      outputFileType="TSX"
      downloadFileName="props.ts"
      emptyStateMessage="TypeScript interface will appear here"
      emptyStateHint="Paste PropTypes on the left, then hit Convert"
      isConverting={isConverting}
      error={error}
      isAstFallback={isAstOnly}
      astFallbackMessage="AI models unavailable  showing basic conversion. Smart event type inference requires AI."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={computeStatusText(isConverting, result)}
      statusState={computeStatusState(isConverting, result)}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <PropTypesToTsControlBar
          options={options}
          onOptionsChange={setOptions}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <PropTypesToTsConversionStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
