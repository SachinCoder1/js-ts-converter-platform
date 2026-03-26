'use client';

import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PoweredByIndicator, KeyboardShortcutHint } from '@/components/shared/provider-selector';
import type {
  TailwindConversionOptions,
  TailwindInputFormat,
  TailwindOutputFormat,
  TailwindVersion,
} from '@/lib/tailwind-types';

interface TailwindControlBarProps {
  options: TailwindConversionOptions;
  onOptionsChange: (options: TailwindConversionOptions) => void;
  onConvert: () => void;
  isConverting: boolean;
}

function ConvertButton({
  onClick,
  isConverting,
}: {
  onClick: () => void;
  isConverting: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isConverting}
      whileHover={isConverting ? {} : { scale: 1.02 }}
      whileTap={isConverting ? {} : { scale: 0.98 }}
      className="relative flex h-9 items-center gap-2 overflow-hidden rounded-md px-5 text-sm font-semibold transition-shadow duration-200"
      style={{
        background: isConverting
          ? 'color-mix(in srgb, var(--primary) 60%, var(--surface))'
          : 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 100%, white 8%) 0%, var(--primary) 100%)',
        color: 'var(--primary-foreground)',
        boxShadow: isConverting
          ? 'none'
          : '0 0 0 1px color-mix(in srgb, var(--primary) 50%, transparent), 0 1px 2px rgba(0,0,0,0.2), 0 0 20px var(--glow)',
        cursor: isConverting ? 'wait' : 'pointer',
        willChange: 'transform',
        letterSpacing: '-0.01em',
      }}
    >
      {isConverting && (
        <div
          className="shimmer absolute inset-0 z-0"
          style={{ pointerEvents: 'none' }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {isConverting ? (
          <span className="text-xs font-medium" style={{ opacity: 0.9 }}>
            Converting...
          </span>
        ) : (
          <>
            Convert
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </motion.svg>
          </>
        )}
      </span>
    </motion.button>
  );
}

export function TailwindControlBar({
  options,
  onOptionsChange,
  onConvert,
  isConverting,
}: TailwindControlBarProps) {
  const updateOption = <K extends keyof TailwindConversionOptions>(
    key: K,
    value: TailwindConversionOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Input format */}
      <Select
        value={options.inputFormat}
        onValueChange={(v) => updateOption('inputFormat', v as TailwindInputFormat)}
      >
        <SelectTrigger
          className="h-8 w-[130px] rounded-md border text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{options.inputFormat === 'classes' ? 'Class String' : 'HTML with Classes'}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="classes">Class String</SelectItem>
          <SelectItem value="html">HTML with Classes</SelectItem>
        </SelectContent>
      </Select>

      {/* Output format */}
      <Select
        value={options.outputFormat}
        onValueChange={(v) => updateOption('outputFormat', v as TailwindOutputFormat)}
      >
        <SelectTrigger
          className="h-8 w-[150px] rounded-md border text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{{ single: 'Single Ruleset', grouped: 'Grouped by Category', 'media-queries': 'With Media Queries' }[options.outputFormat]}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single">Single Ruleset</SelectItem>
          <SelectItem value="grouped">Grouped by Category</SelectItem>
          <SelectItem value="media-queries">With Media Queries</SelectItem>
        </SelectContent>
      </Select>

      {/* TW version */}
      <Select
        value={options.twVersion}
        onValueChange={(v) => updateOption('twVersion', v as TailwindVersion)}
      >
        <SelectTrigger
          className="h-8 w-[80px] rounded-md border text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{options.twVersion === 'v3' ? 'TW v3' : 'TW v4'}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="v3">TW v3</SelectItem>
          <SelectItem value="v4">TW v4</SelectItem>
        </SelectContent>
      </Select>

      {/* Comments toggle */}
      <button
        onClick={() => updateOption('includeComments', !options.includeComments)}
        className="flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors duration-150"
        style={{
          borderColor: options.includeComments
            ? 'color-mix(in srgb, var(--primary) 40%, var(--border))'
            : 'var(--border)',
          background: options.includeComments
            ? 'color-mix(in srgb, var(--primary) 8%, var(--surface))'
            : 'var(--surface)',
          color: options.includeComments ? 'var(--primary)' : 'var(--text-tertiary)',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
        Comments {options.includeComments ? 'On' : 'Off'}
      </button>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      <ConvertButton onClick={onConvert} isConverting={isConverting} />

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      <PoweredByIndicator />

      <KeyboardShortcutHint />
    </div>
  );
}
