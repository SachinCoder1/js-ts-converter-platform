'use client';

import { useState, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { JsToJsonOptionsBar } from './js-to-json-options-bar';
import { useJsToJson } from '@/hooks/use-js-to-json';
import { DEFAULT_JS_OBJECT_EXAMPLE } from '@/lib/js-to-json/constants';
import type { IndentOption, UndefinedHandling, SortKeys, JsToJsonOptions } from '@/lib/js-to-json/types';

export function JsToJsonConverter() {
  const [input, setInput] = useState(DEFAULT_JS_OBJECT_EXAMPLE);

  // Options state
  const [indent, setIndent] = useState<IndentOption>('2');
  const [undefinedHandling, setUndefinedHandling] = useState<UndefinedHandling>('remove');
  const [sortKeys, setSortKeys] = useState<SortKeys>('off');

  const options: JsToJsonOptions = useMemo(
    () => ({ indent, undefinedHandling, sortKeys }),
    [indent, undefinedHandling, sortKeys]
  );

  const { json, error, stats, duration, isProcessing } = useJsToJson(input, options);

  // Status bar
  const statusText = isProcessing
    ? 'Converting...'
    : error
      ? 'Error'
      : json
        ? `Converted in ${duration}ms`
        : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = isProcessing
    ? 'active'
    : error
      ? 'idle'
      : json
        ? 'done'
        : 'idle';

  const hasStats = json && (stats.commentsStripped > 0 || stats.keysRemoved > 0 || stats.specialValuesConverted > 0);

  return (
    <ConverterLayout
      inputValue={input}
      onInputChange={setInput}
      outputValue={json}
      inputLanguage="javascript"
      outputLanguage="json"
      inputFileType="JS"
      outputFileType="JSON"
      downloadFileName="output.json"
      emptyStateMessage="JSON output will appear here"
      emptyStateHint="Paste a JS object on the left for live conversion"
      isConverting={isProcessing}
      error={error}
      statusText={statusText}
      statusState={statusState}
      isLiveMode
      renderControlBar={() => (
        <JsToJsonOptionsBar
          indent={indent}
          onIndentChange={setIndent}
          undefinedHandling={undefinedHandling}
          onUndefinedHandlingChange={setUndefinedHandling}
          sortKeys={sortKeys}
          onSortKeysChange={setSortKeys}
        />
      )}
      renderStats={() =>
        hasStats ? (
          <div className="flex flex-wrap items-center gap-2 py-2">
            {stats.commentsStripped > 0 && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--text-secondary) 10%, transparent)',
                  color: 'var(--text-secondary)',
                }}
              >
                {stats.commentsStripped} comment{stats.commentsStripped > 1 ? 's' : ''} stripped
              </span>
            )}
            {stats.keysRemoved > 0 && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--warning) 10%, transparent)',
                  color: 'var(--warning)',
                }}
              >
                {stats.keysRemoved} key{stats.keysRemoved > 1 ? 's' : ''} removed
              </span>
            )}
            {stats.specialValuesConverted > 0 && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  color: 'var(--primary)',
                }}
              >
                {stats.specialValuesConverted} special value{stats.specialValuesConverted > 1 ? 's' : ''} converted
              </span>
            )}
          </div>
        ) : null
      }
    />
  );
}
