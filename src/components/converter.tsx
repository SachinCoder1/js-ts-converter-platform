'use client';

import { useState, useCallback } from 'react';
import { ConverterLayout } from './converter-layout/converter-layout';
import { ControlBar } from './control-bar';
import { ConversionStats } from './conversion-stats';
import { useAstPreview } from '@/hooks/use-ast-preview';
import { useConversion } from '@/hooks/use-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { DEFAULT_EXAMPLE_CODE } from '@/lib/constants';
import { getOutputFileType, getMonacoLanguage } from '@/lib/utils';
import { computeStatusText, computeStatusState } from '@/lib/converter-utils';
import type { FileType } from '@/lib/types';

export function Converter() {
  const [inputCode, setInputCode] = useState(DEFAULT_EXAMPLE_CODE);
  const [fileType, setFileType] = useState<FileType>('jsx');
  const [isScanning, setIsScanning] = useState(false);

  const { preview } = useAstPreview(inputCode, fileType);
  const { result, isConverting, error, fromCache, rateLimitInfo, isRateLimited, convert } = useConversion();

  const outputCode = result?.convertedCode || preview;
  const outputFileType = getOutputFileType(fileType);
  const outputLanguage = getMonacoLanguage(outputFileType);
  const inputLanguage = getMonacoLanguage(fileType);

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert(inputCode, fileType);
  }, [inputCode, fileType, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting && !isRateLimited);

  return (
    <ConverterLayout
      inputValue={inputCode}
      onInputChange={setInputCode}
      outputValue={outputCode}
      inputLanguage={inputLanguage}
      outputLanguage={outputLanguage}
      inputFileType={fileType.toUpperCase()}
      outputFileType={outputFileType.toUpperCase()}
      downloadFileName={`converted.${outputFileType}`}
      isConverting={isConverting}
      error={error}
      isAstFallback={result?.provider === 'ast-only'}
      astFallbackMessage="AI models unavailable  showing basic conversion. Some types may need manual refinement."
      fromCache={fromCache}
      resultKey={result?.convertedCode}
      statusText={computeStatusText(isConverting, result)}
      statusState={computeStatusState(isConverting, result)}
      modelIndicator="Auto"
      inputIsScanning={isScanning}
      rateLimitRemaining={rateLimitInfo.remaining}
      rateLimitTotal={rateLimitInfo.limit}
      renderControlBar={() => (
        <ControlBar
          fileType={fileType}
          onFileTypeChange={setFileType}
          onConvert={handleConvert}
          isConverting={isConverting || isRateLimited}
        />
      )}
      renderStats={() =>
        result ? <ConversionStats result={result} fromCache={fromCache} /> : null
      }
    />
  );
}
