'use client';

import { useState, useEffect, useRef } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { JsonYamlControlBar } from './json-yaml-control-bar';
import { convertJsonToYaml, DEFAULT_OPTIONS } from '@/lib/json-to-yaml';
import { DEFAULT_JSON_EXAMPLE } from '@/lib/constants';
import type { JsonToYamlOptions } from '@/lib/json-to-yaml';

export function JsonYamlConverter() {
  const [inputJson, setInputJson] = useState(DEFAULT_JSON_EXAMPLE);
  const [options, setOptions] = useState<JsonToYamlOptions>(DEFAULT_OPTIONS);
  const [outputYaml, setOutputYaml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced conversion on input or options change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const result = convertJsonToYaml(inputJson, options);
      setOutputYaml(result.yaml);
      setError(result.error);
      setDuration(result.duration);
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputJson, options]);

  const statusText = error
    ? 'Invalid JSON'
    : duration !== null && outputYaml
      ? `Converted in ${duration}ms`
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = error
    ? 'idle'
    : outputYaml
      ? 'done'
      : 'idle';

  return (
    <ConverterLayout
      inputValue={inputJson}
      onInputChange={setInputJson}
      outputValue={outputYaml}
      inputLanguage="json"
      outputLanguage="yaml"
      inputFileType="JSON"
      outputFileType="YAML"
      downloadFileName="converted.yaml"
      emptyStateMessage="YAML output will appear here"
      emptyStateHint="Start typing JSON on the left to see live conversion"
      error={error}
      statusText={statusText}
      statusState={statusState}
      isLiveMode={true}
      renderControlBar={() => (
        <JsonYamlControlBar options={options} onOptionsChange={setOptions} />
      )}
    />
  );
}
