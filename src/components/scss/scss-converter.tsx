'use client';

import { useState, useCallback } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { ScssControlBar } from './scss-control-bar';
import { ScssCompilationStats } from './scss-compilation-stats';
import { useScssConversion } from '@/hooks/use-scss-conversion';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { DEFAULT_SCSS_EXAMPLE } from '@/lib/constants';
import type { ScssSyntax, ScssOutputStyle } from '@/lib/types';

export function ScssConverter() {
  const [inputCode, setInputCode] = useState(DEFAULT_SCSS_EXAMPLE);
  const [syntax, setSyntax] = useState<ScssSyntax>('scss');
  const [outputStyle, setOutputStyle] = useState<ScssOutputStyle>('expanded');
  const [isScanning, setIsScanning] = useState(false);

  const { result, isConverting, error, convert } = useScssConversion();

  const outputCode = result?.css || '';

  const handleConvert = useCallback(() => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 350);
    convert(inputCode, syntax, outputStyle);
  }, [inputCode, syntax, outputStyle, convert]);

  useKeyboardShortcut('Enter', handleConvert, !isConverting);

  // Status bar state
  const statusText = isConverting
    ? 'Compiling via Dart Sass...'
    : result
      ? `Compiled in ${result.stats.compilationTime < 1000 ? result.stats.compilationTime + 'ms' : (result.stats.compilationTime / 1000).toFixed(1) + 's'}`
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = isConverting
    ? 'active'
    : result
      ? 'done'
      : 'idle';

  return (
    <ConverterLayout
      inputValue={inputCode}
      onInputChange={setInputCode}
      outputValue={outputCode}
      inputLanguage="scss"
      outputLanguage="css"
      inputFileType={syntax.toUpperCase()}
      outputFileType="CSS"
      downloadFileName="compiled.css"
      emptyStateMessage="CSS output will appear here"
      emptyStateHint="Write SCSS on the left, then hit Compile"
      isConverting={isConverting}
      error={error}
      statusText={statusText}
      statusState={statusState}
      inputIsScanning={isScanning}
      renderControlBar={() => (
        <ScssControlBar
          syntax={syntax}
          onSyntaxChange={setSyntax}
          outputStyle={outputStyle}
          onOutputStyleChange={setOutputStyle}
          onConvert={handleConvert}
          isConverting={isConverting}
        />
      )}
      renderStats={() =>
        result ? (
          <ScssCompilationStats result={result} />
        ) : null
      }
    />
  );
}
