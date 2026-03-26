'use client';

import { useState, useEffect, useRef } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { PackageToBadgesControlBar } from './package-to-badges-control-bar';
import { convertPackageToBadges, DEFAULT_OPTIONS } from '@/lib/package-to-badges';
import { DEFAULT_PACKAGE_JSON_EXAMPLE } from '@/lib/constants';
import type { PackageToBadgesOptions } from '@/lib/package-to-badges';

export function PackageToBadgesConverter() {
  const [input, setInput] = useState(DEFAULT_PACKAGE_JSON_EXAMPLE);
  const [options, setOptions] = useState<PackageToBadgesOptions>(DEFAULT_OPTIONS);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced conversion on input or options change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const result = convertPackageToBadges(input, options);
      setOutput(result.badges);
      setError(result.error);
      setDuration(result.duration);
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input, options]);

  const statusText = error
    ? 'Invalid input'
    : duration !== null && output
      ? `Generated in ${duration}ms`
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = error
    ? 'idle'
    : output
      ? 'done'
      : 'idle';

  return (
    <ConverterLayout
      inputValue={input}
      onInputChange={setInput}
      outputValue={output}
      inputLanguage="json"
      outputLanguage="markdown"
      inputFileType="JSON"
      outputFileType="MD"
      downloadFileName="badges.md"
      emptyStateMessage="README badges will appear here"
      emptyStateHint="Paste a package.json on the left to see live badge generation"
      error={error}
      statusText={statusText}
      statusState={statusState}
      isLiveMode={true}
      renderControlBar={() => (
        <PackageToBadgesControlBar options={options} onOptionsChange={setOptions} />
      )}
    />
  );
}
