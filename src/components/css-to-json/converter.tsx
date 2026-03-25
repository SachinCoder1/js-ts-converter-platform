'use client';

import { useState } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { CssToJsonControlBar } from './control-bar';
import { CssToJsonStats } from './conversion-stats';
import { useCssToJson } from '@/hooks/use-css-to-json';
import { DEFAULT_CSS_EXAMPLE } from '@/lib/css-to-json/constants';
import type { CssToJsonOptions } from '@/lib/css-to-json';

export function CssToJsonConverter() {
  const [cssInput, setCssInput] = useState(DEFAULT_CSS_EXAMPLE);
  const [options, setOptions] = useState<CssToJsonOptions>({
    keyFormat: 'camelCase',
    numericValues: 'strings',
    wrapper: 'none',
  });

  const { output, ruleCount, propertyCount, duration, error, isProcessing } =
    useCssToJson(cssInput, options);

  const statusText = isProcessing
    ? 'Converting...'
    : output
      ? `Converted ${ruleCount} rule${ruleCount !== 1 ? 's' : ''} in ${duration}ms`
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = isProcessing
    ? 'active'
    : output
      ? 'done'
      : 'idle';

  return (
    <ConverterLayout
      inputValue={cssInput}
      onInputChange={setCssInput}
      outputValue={output}
      inputLanguage="css"
      outputLanguage="json"
      inputFileType="CSS"
      outputFileType="JSON"
      downloadFileName="styles.json"
      emptyStateMessage="JSON output will appear here"
      emptyStateHint="Paste CSS on the left to convert"
      isAstFallback={!!error}
      astFallbackMessage={error ?? undefined}
      statusText={statusText}
      statusState={statusState}
      isLiveMode={true}
      renderControlBar={() => (
        <CssToJsonControlBar options={options} onOptionsChange={setOptions} />
      )}
      renderStats={() =>
        output && ruleCount > 0 ? (
          <CssToJsonStats
            ruleCount={ruleCount}
            propertyCount={propertyCount}
            duration={duration}
          />
        ) : null
      }
    />
  );
}
