'use client';

import { useState, useCallback, useMemo } from 'react';
import { RegexInputBar } from './regex-input-bar';
import { TestStringEditor } from './test-string-editor';
import { MatchesPanel } from './matches-panel';
import { RegexTabsPanel } from './regex-tabs-panel';
import { StatusBar } from '@/components/status-bar';
import { ErrorBanner } from '@/components/error-banner';
import { useRegexTester } from '@/hooks/use-regex-tester';
import { useRegexAi } from '@/hooks/use-regex-ai';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { DEFAULT_REGEX_PATTERN, DEFAULT_REGEX_FLAGS, DEFAULT_REGEX_TEST_STRING } from '@/lib/constants';
import type { RegexFlavor, RegexFlag } from '@/lib/types';

export function RegexConverter() {
  const [pattern, setPattern] = useState(DEFAULT_REGEX_PATTERN);
  const [flags, setFlags] = useState<Set<RegexFlag>>(() => {
    const initial = new Set<RegexFlag>();
    for (const ch of DEFAULT_REGEX_FLAGS) {
      initial.add(ch as RegexFlag);
    }
    return initial;
  });
  const [testString, setTestString] = useState(DEFAULT_REGEX_TEST_STRING);
  const [sourceFlavor, setSourceFlavor] = useState<RegexFlavor>('javascript');

  const flagsString = useMemo(() => Array.from(flags).join(''), [flags]);

  const testResult = useRegexTester(pattern, flagsString, testString);

  const {
    explainResult,
    convertResult,
    isExplaining,
    isConverting,
    explainError,
    convertError,
    rateLimitInfo,
    isRateLimited,
    explain,
    convertRegex,
  } = useRegexAi();

  const handleExplain = useCallback(() => {
    explain(pattern, flagsString, sourceFlavor);
  }, [pattern, flagsString, sourceFlavor, explain]);

  const handleConvert = useCallback((targetFlavors: RegexFlavor[]) => {
    convertRegex(pattern, flagsString, sourceFlavor, targetFlavors);
  }, [pattern, flagsString, sourceFlavor, convertRegex]);

  useKeyboardShortcut('Enter', handleExplain, !isExplaining && !isRateLimited);

  const statusText = isExplaining || isConverting
    ? 'Processing...'
    : explainResult || convertResult
      ? `Done in ${(explainResult?.duration || convertResult?.duration || 0)}ms`
      : testResult.matchCount > 0
        ? `${testResult.matchCount} match${testResult.matchCount !== 1 ? 'es' : ''} found`
        : 'Ready';

  const statusState: 'idle' | 'active' | 'done' =
    isExplaining || isConverting ? 'active' :
    explainResult || convertResult ? 'done' : 'idle';

  return (
    <div className="flex flex-1 flex-col px-4 sm:px-6 py-3 max-w-screen-2xl mx-auto w-full">
      {/* Regex input bar */}
      <RegexInputBar
        pattern={pattern}
        onPatternChange={setPattern}
        flags={flags}
        onFlagsChange={setFlags}
        onTestStringChange={setTestString}
        sourceFlavor={sourceFlavor}
        onSourceFlavorChange={setSourceFlavor}
        onExplain={handleExplain}
        isExplaining={isExplaining || isRateLimited}
        isRateLimited={isRateLimited}
        regexError={testResult.error}
      />

      {/* Error banners */}
      {(explainError || convertError) && (
        <ErrorBanner
          message={explainError || convertError || ''}
          variant="error"
        />
      )}

      {/* Source flavor notice */}
      {sourceFlavor !== 'javascript' && testResult.matchCount > 0 && (
        <p
          className="text-[10px] font-mono py-1 px-1"
          style={{ color: 'var(--text-disabled)' }}
        >
          Live testing uses JavaScript regex engine. Use the Convert tab for {sourceFlavor} syntax.
        </p>
      )}

      {/* Main area: test string + matches */}
      <div className="flex flex-1 gap-3 min-h-0 mt-1" style={{ minHeight: '300px', maxHeight: '500px' }}>
        {/* Test string editor */}
        <div className="flex-1 min-w-0">
          <TestStringEditor
            value={testString}
            onChange={setTestString}
            testResult={testResult}
          />
        </div>

        {/* Matches panel */}
        <div className="w-[300px] shrink-0 hidden md:block">
          <MatchesPanel testResult={testResult} />
        </div>
      </div>

      {/* Mobile matches panel */}
      <div className="md:hidden mt-3" style={{ maxHeight: '200px' }}>
        <MatchesPanel testResult={testResult} />
      </div>

      {/* Tabs panel */}
      <RegexTabsPanel
        explainResult={explainResult}
        convertResult={convertResult}
        isExplaining={isExplaining}
        isConverting={isConverting}
        explainError={explainError}
        convertError={convertError}
        sourceFlavor={sourceFlavor}
        onExplain={handleExplain}
        onConvert={handleConvert}
      />

      {/* Status bar */}
      <StatusBar
        text={statusText}
        state={statusState}
        fromCache={(explainResult?.fromCache || convertResult?.fromCache) ?? false}
        rateLimitRemaining={rateLimitInfo.remaining}
        rateLimitTotal={rateLimitInfo.limit}
      />
    </div>
  );
}
