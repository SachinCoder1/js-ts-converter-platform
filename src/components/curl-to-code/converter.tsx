'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { CurlToCodeControlBar } from './control-bar';
import { CurlToCodeConversionStats } from './conversion-stats';
import { useCurlPreview } from '@/hooks/use-curl-preview';
import { useCurlConversion } from '@/hooks/use-curl-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { DEFAULT_CURL_EXAMPLE, DEFAULT_CURL_OPTIONS } from '@/lib/constants';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import { OUTPUT_LANG_MAP } from '@/lib/curl-to-code/generators';
import type { CurlToCodeOptions } from '@/lib/types';

export function CurlToCodeConverter() {
  const [inputCurl, setInputCurl] = useState(DEFAULT_CURL_EXAMPLE);
  const [options, setOptions] = useState<CurlToCodeOptions>(DEFAULT_CURL_OPTIONS);
  const [isScanning, setIsScanning] = useState(false);

  const stableOptions = useMemo(() => options, [
    options.targetLanguage,
    options.codeStyle,
    options.errorHandling,
    options.variableStyle,
  ]);

  const { preview, parseError } = useCurlPreview(inputCurl, stableOptions);
  const { result, isConverting, error, fromCache, convert, rateLimitInfo, isRateLimited } =
    useCurlConversion(options.targetLanguage);

  const outputCode = result?.convertedCode || preview;
  const outputConfig = OUTPUT_LANG_MAP[options.targetLanguage];

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert(inputCurl, options);
  }, [inputCurl, options, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  const isAstOnly = result?.provider === 'ast-only';
  const displayError = error || (parseError ? `Parse error: ${parseError}` : null);

  return (
    <ConverterLayout
      inputValue={inputCurl}
      onInputChange={setInputCurl}
      outputValue={outputCode}
      inputLanguage="shell"
      outputLanguage={outputConfig.language}
      inputFileType="CURL"
      outputFileType={outputConfig.fileType}
      downloadFileName={outputConfig.fileName}
      emptyStateMessage="Generated code will appear here"
      emptyStateHint="Paste a cURL command on the left, then hit Convert"
      isConverting={isConverting}
      error={displayError}
      isAstFallback={isAstOnly && !error && !parseError}
      astFallbackMessage="AI models unavailable  showing rule-based conversion. Complex cases may need manual refinement."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={computeStatusText(isConverting, result)}
      statusState={computeStatusState(isConverting, result)}
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <CurlToCodeControlBar
          options={options}
          onOptionsChange={setOptions}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <CurlToCodeConversionStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
