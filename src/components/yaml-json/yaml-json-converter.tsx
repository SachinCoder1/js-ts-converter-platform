'use client';

import { useState, useEffect, useRef } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { YamlJsonControlBar } from './yaml-json-control-bar';
import { convertYamlToJson, DEFAULT_YAML_TO_JSON_OPTIONS } from '@/lib/yaml-to-json';
import { DEFAULT_YAML_EXAMPLE } from '@/lib/constants';
import type { YamlToJsonOptions } from '@/lib/yaml-to-json';

export function YamlJsonConverter() {
  const [inputYaml, setInputYaml] = useState(DEFAULT_YAML_EXAMPLE);
  const [options, setOptions] = useState<YamlToJsonOptions>(DEFAULT_YAML_TO_JSON_OPTIONS);
  const [outputJson, setOutputJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced conversion on input or options change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const result = convertYamlToJson(inputYaml, options);
      setOutputJson(result.json);
      setError(result.error);
      setDuration(result.duration);
      setDocumentCount(result.documentCount);
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputYaml, options]);

  const statusText = error
    ? 'Invalid YAML'
    : duration !== null && outputJson
      ? `Converted in ${duration}ms${documentCount > 1 ? ` (${documentCount} documents)` : ''}`
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = error
    ? 'idle'
    : outputJson
      ? 'done'
      : 'idle';

  return (
    <ConverterLayout
      inputValue={inputYaml}
      onInputChange={setInputYaml}
      outputValue={outputJson}
      inputLanguage="yaml"
      outputLanguage="json"
      inputFileType="YAML"
      outputFileType="JSON"
      downloadFileName="converted.json"
      emptyStateMessage="JSON output will appear here"
      emptyStateHint="Paste or type YAML on the left"
      error={error}
      statusText={statusText}
      statusState={statusState}
      isLiveMode={true}
      renderControlBar={() => (
        <YamlJsonControlBar options={options} onOptionsChange={setOptions} />
      )}
    />
  );
}
