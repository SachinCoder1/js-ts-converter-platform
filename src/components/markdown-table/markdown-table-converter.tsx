'use client';

import { useState, useEffect, useRef } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { MarkdownTableControlBar } from './markdown-table-control-bar';
import { convertMarkdownTable, DEFAULT_OPTIONS } from '@/lib/markdown-table-converter';
import { DEFAULT_MARKDOWN_TABLE_EXAMPLE } from '@/lib/constants';
import type { MarkdownTableOptions, DetectedFormat } from '@/lib/markdown-table-converter';

const FORMAT_TO_LANGUAGE: Record<DetectedFormat, string> = {
  markdown: 'markdown',
  json: 'json',
  csv: 'plaintext',
};

const FORMAT_TO_FILE_TYPE: Record<DetectedFormat, string> = {
  markdown: 'MD',
  json: 'JSON',
  csv: 'CSV',
};

const FORMAT_TO_EXT: Record<DetectedFormat, string> = {
  markdown: 'md',
  json: 'json',
  csv: 'csv',
};

export function MarkdownTableConverter() {
  const [input, setInput] = useState(DEFAULT_MARKDOWN_TABLE_EXAMPLE);
  const [options, setOptions] = useState<MarkdownTableOptions>(DEFAULT_OPTIONS);
  const [output1, setOutput1] = useState('');
  const [output2, setOutput2] = useState('');
  const [output1Format, setOutput1Format] = useState<DetectedFormat>('json');
  const [output2Format, setOutput2Format] = useState<DetectedFormat>('csv');
  const [activeTab, setActiveTab] = useState<'output1' | 'output2'>('output1');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const result = convertMarkdownTable(input, options);
      setOutput1(result.output1);
      setOutput2(result.output2);
      setOutput1Format(result.output1Format);
      setOutput2Format(result.output2Format);
      setError(result.error);
      setDuration(result.duration);
    }, 150);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input, options]);

  const currentOutput = activeTab === 'output1' ? output1 : output2;
  const currentFormat = activeTab === 'output1' ? output1Format : output2Format;

  const statusText = error
    ? 'Invalid input'
    : duration !== null && currentOutput
      ? `Converted in ${duration}ms`
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = error
    ? 'idle'
    : currentOutput
      ? 'done'
      : 'idle';

  return (
    <ConverterLayout
      inputValue={input}
      onInputChange={setInput}
      outputValue={currentOutput}
      inputLanguage="markdown"
      outputLanguage={FORMAT_TO_LANGUAGE[currentFormat]}
      inputFileType="MD"
      outputFileType={FORMAT_TO_FILE_TYPE[currentFormat]}
      downloadFileName={`converted.${FORMAT_TO_EXT[currentFormat]}`}
      emptyStateMessage="Converted output will appear here"
      emptyStateHint="Paste a Markdown table, JSON array, or CSV on the left"
      error={error}
      statusText={statusText}
      statusState={statusState}
      isLiveMode={true}
      renderControlBar={() => (
        <MarkdownTableControlBar
          options={options}
          onOptionsChange={setOptions}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          output1Format={output1Format}
          output2Format={output2Format}
        />
      )}
    />
  );
}
