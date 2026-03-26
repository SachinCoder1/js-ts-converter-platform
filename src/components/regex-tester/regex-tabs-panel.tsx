'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OptionSwitch } from '@/components/shared/option-switch';
import { ConvertButton } from '@/components/shared/convert-button';
import { RegexCheatsheet } from './regex-cheatsheet';
import type { RegexFlavor, RegexExplainResult, RegexConvertResult, RegexConversionEntry } from '@/lib/types';

type TabValue = 'explanation' | 'convert' | 'cheatsheet';

const TAB_OPTIONS: { value: TabValue; label: string }[] = [
  { value: 'explanation', label: 'Explanation' },
  { value: 'convert', label: 'Convert' },
  { value: 'cheatsheet', label: 'Cheatsheet' },
];

const TARGET_FLAVOR_OPTIONS: { value: RegexFlavor; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
];

interface RegexTabsPanelProps {
  explainResult: RegexExplainResult | null;
  convertResult: RegexConvertResult | null;
  isExplaining: boolean;
  isConverting: boolean;
  explainError: string | null;
  convertError: string | null;
  sourceFlavor: RegexFlavor;
  onExplain: () => void;
  onConvert: (targetFlavors: RegexFlavor[]) => void;
}

export function RegexTabsPanel({
  explainResult,
  convertResult,
  isExplaining,
  isConverting,
  explainError,
  convertError,
  sourceFlavor,
  onExplain,
  onConvert,
}: RegexTabsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('explanation');
  const [targetFlavors, setTargetFlavors] = useState<Set<RegexFlavor>>(
    new Set(TARGET_FLAVOR_OPTIONS.filter(f => f.value !== sourceFlavor).map(f => f.value)),
  );

  const toggleFlavor = useCallback((flavor: RegexFlavor) => {
    setTargetFlavors(prev => {
      const next = new Set(prev);
      if (next.has(flavor)) {
        if (next.size > 1) next.delete(flavor);
      } else {
        next.add(flavor);
      }
      return next;
    });
  }, []);

  const handleConvert = useCallback(() => {
    onConvert(Array.from(targetFlavors));
  }, [onConvert, targetFlavors]);

  return (
    <div
      className="rounded-md mt-3 overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-3 px-3 py-2"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--background)',
        }}
      >
        <OptionSwitch
          value={activeTab}
          onChange={setActiveTab}
          options={TAB_OPTIONS}
          ariaLabel="Result tabs"
        />
      </div>

      {/* Tab content */}
      <div
        className="p-4 min-h-[180px] max-h-[400px] overflow-y-auto"
        style={{ background: 'var(--surface)' }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'explanation' && (
            <motion.div
              key="explanation"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ExplanationContent
                result={explainResult}
                isLoading={isExplaining}
                error={explainError}
                onExplain={onExplain}
              />
            </motion.div>
          )}

          {activeTab === 'convert' && (
            <motion.div
              key="convert"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ConvertContent
                result={convertResult}
                isLoading={isConverting}
                error={convertError}
                sourceFlavor={sourceFlavor}
                targetFlavors={targetFlavors}
                onToggleFlavor={toggleFlavor}
                onConvert={handleConvert}
              />
            </motion.div>
          )}

          {activeTab === 'cheatsheet' && (
            <motion.div
              key="cheatsheet"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <RegexCheatsheet />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExplanationContent({
  result,
  isLoading,
  error,
  onExplain,
}: {
  result: RegexExplainResult | null;
  isLoading: boolean;
  error: string | null;
  onExplain: () => void;
}) {
  if (error) {
    return (
      <p className="text-sm font-mono" style={{ color: 'var(--error)' }}>
        {error}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-line h-4 rounded"
            style={{ width: `${60 + Math.random() * 35}%`, animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-2">
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text-primary)' }}
        >
          {result.explanation}
        </p>
        <p
          className="text-[10px] font-mono"
          style={{ color: 'var(--text-disabled)' }}
        >
          via {result.provider} · {result.duration}ms{result.fromCache ? ' · cached' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
        Get a plain English explanation of your regex pattern
      </p>
      <ConvertButton onClick={onExplain} isConverting={false} label="Explain" />
    </div>
  );
}

function ConvertContent({
  result,
  isLoading,
  error,
  sourceFlavor,
  targetFlavors,
  onToggleFlavor,
  onConvert,
}: {
  result: RegexConvertResult | null;
  isLoading: boolean;
  error: string | null;
  sourceFlavor: RegexFlavor;
  targetFlavors: Set<RegexFlavor>;
  onToggleFlavor: (flavor: RegexFlavor) => void;
  onConvert: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Target flavor selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Convert to:
        </span>
        {TARGET_FLAVOR_OPTIONS.filter(f => f.value !== sourceFlavor).map((f) => (
          <button
            key={f.value}
            onClick={() => onToggleFlavor(f.value)}
            className="px-2 py-1 rounded text-xs font-mono transition-colors duration-150"
            style={{
              background: targetFlavors.has(f.value)
                ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
                : 'var(--muted)',
              color: targetFlavors.has(f.value) ? 'var(--primary)' : 'var(--text-tertiary)',
              border: targetFlavors.has(f.value)
                ? '1px solid color-mix(in srgb, var(--primary) 30%, transparent)'
                : '1px solid transparent',
            }}
            aria-pressed={targetFlavors.has(f.value)}
          >
            {f.label}
          </button>
        ))}
        <ConvertButton onClick={onConvert} isConverting={isLoading} label="Convert" />
      </div>

      {error && (
        <p className="text-sm font-mono" style={{ color: 'var(--error)' }}>
          {error}
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-line h-16 rounded"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-2">
          {result.conversions.map((entry) => (
            <ConversionCard key={entry.flavor} entry={entry} />
          ))}
          <p
            className="text-[10px] font-mono"
            style={{ color: 'var(--text-disabled)' }}
          >
            via {result.provider} · {result.duration}ms{result.fromCache ? ' · cached' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

function ConversionCard({ entry }: { entry: RegexConversionEntry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(entry.pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [entry.pattern]);

  const flavorLabel = TARGET_FLAVOR_OPTIONS.find(f => f.value === entry.flavor)?.label || entry.flavor;

  return (
    <div
      className="rounded-md p-3 space-y-2"
      style={{
        background: 'var(--background)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {flavorLabel}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] font-mono px-2 py-0.5 rounded transition-colors"
          style={{
            background: 'var(--muted)',
            color: copied ? 'var(--success)' : 'var(--text-tertiary)',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <code
        className="block text-xs font-mono break-all px-2 py-1.5 rounded"
        style={{
          background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
          color: 'var(--text-primary)',
        }}
      >
        {entry.pattern}
        {entry.flags && (
          <span style={{ color: 'var(--text-tertiary)' }}> (flags: {entry.flags})</span>
        )}
      </code>
      {entry.notes && (
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {entry.notes}
        </p>
      )}
    </div>
  );
}
