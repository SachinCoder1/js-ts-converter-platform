'use client';

import { useState, useEffect, useRef } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { EnvToTypesControlBar } from './env-to-types-control-bar';
import { convertEnvToTypes, DEFAULT_ENV_TO_TYPES_OPTIONS } from '@/lib/env-to-types';
import { DEFAULT_ENV_EXAMPLE } from '@/lib/constants';
import type { EnvToTypesOptions } from '@/lib/env-to-types';

export function EnvToTypesConverter() {
  const [inputEnv, setInputEnv] = useState(DEFAULT_ENV_EXAMPLE);
  const [options, setOptions] = useState<EnvToTypesOptions>(DEFAULT_ENV_TO_TYPES_OPTIONS);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced conversion on input or options change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const result = convertEnvToTypes(inputEnv, options);
      setOutput(result.output);
      setError(result.error);
      setDuration(result.duration);
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputEnv, options]);

  const statusText = error
    ? 'Invalid .env'
    : duration !== null && output
      ? `Converted in ${duration}ms`
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = error
    ? 'idle'
    : output
      ? 'done'
      : 'idle';

  return (
    <ConverterLayout
      inputValue={inputEnv}
      onInputChange={setInputEnv}
      outputValue={output}
      inputLanguage="ini"
      outputLanguage="typescript"
      inputFileType="ENV"
      outputFileType="TS"
      downloadFileName="env.ts"
      emptyStateMessage="TypeScript types will appear here"
      emptyStateHint="Start typing .env content on the left to see live conversion"
      error={error}
      statusText={statusText}
      statusState={statusState}
      isLiveMode={true}
      renderControlBar={() => (
        <EnvToTypesControlBar options={options} onOptionsChange={setOptions} />
      )}
    />
  );
}
