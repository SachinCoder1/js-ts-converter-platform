'use client';

import { useState, useMemo } from 'react';
import { ConverterLayout } from '@/components/converter-layout/converter-layout';
import { HtmlJsxControlBar } from './html-jsx-control-bar';
import { HtmlJsxStats } from './html-jsx-stats';
import { useHtmlToJsx } from '@/hooks/use-html-to-jsx';
import { DEFAULT_HTML_EXAMPLE } from '@/lib/constants';
import type { JsxOutputFormat, ComponentWrapper, QuoteStyle, HtmlToJsxOptions } from '@/lib/html-to-jsx/types';

export function HtmlJsxConverter() {
  const [htmlInput, setHtmlInput] = useState(DEFAULT_HTML_EXAMPLE);
  const [outputFormat, setOutputFormat] = useState<JsxOutputFormat>('jsx');
  const [componentWrapper, setComponentWrapper] = useState<ComponentWrapper>('none');
  const [selfClosingStyle, setSelfClosingStyle] = useState<'always' | 'original'>('always');
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>('double');

  const options: HtmlToJsxOptions = useMemo(() => ({
    outputFormat,
    componentWrapper,
    selfClosingStyle,
    quoteStyle,
  }), [outputFormat, componentWrapper, selfClosingStyle, quoteStyle]);

  const { output, warnings, stats, isProcessing } = useHtmlToJsx(htmlInput, options);

  const outputLanguage = outputFormat === 'tsx' ? 'typescriptreact' : 'javascriptreact';
  const outputFileType = outputFormat.toUpperCase();
  const downloadExt = outputFormat;

  // Status bar state
  const statusText = isProcessing
    ? 'Converting...'
    : output
      ? 'Live preview'
      : 'Ready';
  const statusState: 'idle' | 'active' | 'done' = isProcessing ? 'active' : output ? 'done' : 'idle';

  // Combine warnings into a single message for the AST fallback banner
  const hasWarnings = warnings.length > 0;
  const warningMessage = warnings.join(' \u2022 ');

  return (
    <ConverterLayout
      inputValue={htmlInput}
      onInputChange={setHtmlInput}
      outputValue={output}
      inputLanguage="html"
      outputLanguage={outputLanguage}
      inputFileType="HTML"
      outputFileType={outputFileType}
      downloadFileName={`converted.${downloadExt}`}
      emptyStateMessage="JSX output will appear here"
      emptyStateHint="Paste HTML on the left  conversion is live"
      isAstFallback={hasWarnings}
      astFallbackMessage={warningMessage}
      statusText={statusText}
      statusState={statusState}
      isLiveMode={true}
      renderControlBar={() => (
        <HtmlJsxControlBar
          outputFormat={outputFormat}
          onOutputFormatChange={setOutputFormat}
          componentWrapper={componentWrapper}
          onComponentWrapperChange={setComponentWrapper}
          selfClosingStyle={selfClosingStyle}
          onSelfClosingStyleChange={setSelfClosingStyle}
          quoteStyle={quoteStyle}
          onQuoteStyleChange={setQuoteStyle}
        />
      )}
      renderStats={() =>
        stats ? <HtmlJsxStats stats={stats} /> : null
      }
    />
  );
}
