'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { TailwindControlBar } from './tailwind-control-bar';
import { TailwindStats } from './tailwind-stats';
import { useTailwindConversion } from '@/hooks/use-tailwind-conversion';
import { useTailwindPreview } from '@/hooks/use-tailwind-preview';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import { TAILWIND_DEFAULT_EXAMPLE, TAILWIND_DEFAULT_OPTIONS } from '@/lib/tailwind-constants';
import type { TailwindConversionOptions } from '@/lib/tailwind-types';

export function TailwindConverter() {
  const [inputCode, setInputCode] = useState(TAILWIND_DEFAULT_EXAMPLE);
  const [options, setOptions] = useState<TailwindConversionOptions>(TAILWIND_DEFAULT_OPTIONS);
  const [isScanning, setIsScanning] = useState(false);

  // Memoize options to prevent unnecessary re-renders in useTailwindPreview
  const stableOptions = useMemo(() => options, [options.inputFormat, options.outputFormat, options.twVersion, options.includeComments]);

  const { preview } = useTailwindPreview(inputCode, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useTailwindConversion();

  const outputCode = result?.convertedCss || preview;
  const inputLanguage = options.inputFormat === 'html' ? 'html' : 'plaintext';
  const inputFileType = options.inputFormat === 'html' ? 'HTML' : 'TW';

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert(inputCode, options);
  }, [inputCode, options, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isRuleOnly = result?.provider === 'ast-only';

  return (
    <ConverterLayout
      inputValue={inputCode}
      onInputChange={setInputCode}
      outputValue={outputCode}
      inputLanguage={inputLanguage}
      outputLanguage="css"
      inputFileType={inputFileType}
      outputFileType="CSS"
      downloadFileName="output.css"
      emptyStateMessage="CSS output will appear here"
      emptyStateHint="Paste Tailwind classes on the left, then hit Convert"
      isConverting={isConverting}
      error={error}
      isAstFallback={isRuleOnly}
      astFallbackMessage="AI models unavailable  showing rule-based conversion. Some complex utilities may not be fully resolved."
      fromCache={fromCache}
      resultKey={result?.convertedCss}
      statusText={computeStatusText(isConverting, result)}
      statusState={computeStatusState(isConverting, result)}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <TailwindControlBar
          options={options}
          onOptionsChange={setOptions}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <TailwindStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
