'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { CssToTailwindControlBar } from './control-bar';
import { CssToTailwindConversionStats } from './conversion-stats';
import { useCssPreview } from '@/hooks/use-css-preview';
import { useToolConversion } from '@/hooks/use-tool-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { DEFAULT_CSS_EXAMPLE } from '@/lib/constants';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import type { CssToTailwindOptions, CssToTailwindResult } from '@/lib/types';

export function CssToTailwindConverter() {
  const [inputCss, setInputCss] = useState(DEFAULT_CSS_EXAMPLE);
  const [options, setOptions] = useState<CssToTailwindOptions>({
    tailwindVersion: 'v3',
    arbitraryValues: 'allow',
    outputFormat: 'classes-only',
    prefix: '',
    colorFormat: 'named',
  });
  const [isScanning, setIsScanning] = useState(false);

  const stableOptions = useMemo(() => options, [
    options.tailwindVersion,
    options.arbitraryValues,
    options.outputFormat,
    options.prefix,
    options.colorFormat,
  ]);

  const { preview } = useCssPreview(inputCss, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } = useToolConversion<CssToTailwindResult>(
    '/api/css-to-tailwind',
    'css',
  );

  const outputCode = result?.convertedCode || preview;

  // Determine output language based on format
  const outputLanguage = options.outputFormat === 'apply' ? 'css' : 'plaintext';
  const outputFileType = options.outputFormat === 'apply' ? 'CSS' : 'TW';

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert({ css: inputCss, options });
  }, [inputCss, options, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';

  return (
    <ConverterLayout
      inputValue={inputCss}
      onInputChange={setInputCss}
      outputValue={outputCode}
      inputLanguage="css"
      outputLanguage={outputLanguage}
      inputFileType="CSS"
      outputFileType={outputFileType}
      downloadFileName={options.outputFormat === 'apply' ? 'tailwind.css' : 'tailwind.txt'}
      emptyStateMessage="Tailwind classes will appear here"
      emptyStateHint="Paste CSS on the left, then hit Convert"
      isConverting={isConverting}
      error={error}
      isAstFallback={isAstOnly}
      astFallbackMessage="AI models unavailable  showing basic conversion. Complex CSS properties may need manual review."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={computeStatusText(isConverting, result)}
      statusState={computeStatusState(isConverting, result)}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <CssToTailwindControlBar
          options={options}
          onOptionsChange={setOptions}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <CssToTailwindConversionStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
