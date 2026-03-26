'use client';

import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CssToJsonOptions } from '@/lib/css-to-json';

interface CssToJsonControlBarProps {
  options: CssToJsonOptions;
  onOptionsChange: (options: CssToJsonOptions) => void;
}

function SegmentToggle<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: readonly { value: T; label: string }[];
}) {
  const activeIndex = items.findIndex((item) => item.value === value);
  const itemCount = items.length;

  return (
    <div
      className="relative flex h-8 rounded-md p-0.5"
      style={{ background: 'var(--muted)' }}
    >
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-[5px]"
        style={{
          width: `calc(${100 / itemCount}% - 2px)`,
          background: 'var(--surface)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
        animate={{ x: activeIndex === 0 ? 2 : `calc(${activeIndex * 100}% + 2px)` }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className="relative z-10 flex h-full items-center justify-center px-3 font-mono text-xs font-medium transition-colors duration-150"
          style={{
            color: value === item.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

const KEY_FORMAT_ITEMS = [
  { value: 'camelCase' as const, label: 'camelCase' },
  { value: 'kebab-case' as const, label: 'kebab-case' },
] as const;

const NUMERIC_ITEMS = [
  { value: 'strings' as const, label: 'Strings' },
  { value: 'numbers' as const, label: 'Numbers' },
] as const;

export function CssToJsonControlBar({
  options,
  onOptionsChange,
}: CssToJsonControlBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Key format toggle */}
      <SegmentToggle
        value={options.keyFormat}
        onChange={(v) => onOptionsChange({ ...options, keyFormat: v })}
        items={KEY_FORMAT_ITEMS}
      />

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Numeric values toggle */}
      <SegmentToggle
        value={options.numericValues}
        onChange={(v) => onOptionsChange({ ...options, numericValues: v })}
        items={NUMERIC_ITEMS}
      />

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Wrapper select */}
      <Select
        value={options.wrapper}
        onValueChange={(v) =>
          onOptionsChange({ ...options, wrapper: v as CssToJsonOptions['wrapper'] })
        }
      >
        <SelectTrigger
          className="h-8 w-[180px] rounded-md border text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{{ none: 'No wrapper', stylesheet: 'StyleSheet.create()', css: "css({})" }[options.wrapper]}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No wrapper</SelectItem>
          <SelectItem value="stylesheet">StyleSheet.create()</SelectItem>
          <SelectItem value="css">css({'{}'})</SelectItem>
        </SelectContent>
      </Select>

      {/* Auto-convert hint */}
      <span
        className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono"
        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'var(--success)',
            boxShadow: '0 0 4px var(--success)',
          }}
        />
        Auto-converts as you type
      </span>
    </div>
  );
}
