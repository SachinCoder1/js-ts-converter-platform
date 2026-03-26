'use client';

import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { JsxOutputFormat, ComponentWrapper, QuoteStyle } from '@/lib/html-to-jsx/types';

interface HtmlJsxControlBarProps {
  outputFormat: JsxOutputFormat;
  onOutputFormatChange: (format: JsxOutputFormat) => void;
  componentWrapper: ComponentWrapper;
  onComponentWrapperChange: (wrapper: ComponentWrapper) => void;
  selfClosingStyle: 'always' | 'original';
  onSelfClosingStyleChange: (style: 'always' | 'original') => void;
  quoteStyle: QuoteStyle;
  onQuoteStyleChange: (style: QuoteStyle) => void;
}

/* ─── Segment toggle  iOS-style ─── */
function SegmentToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const activeIdx = options.findIndex((o) => o.value === value);
  const count = options.length;

  return (
    <div
      className="relative flex h-8 rounded-md p-0.5"
      style={{ background: 'var(--muted)' }}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-[5px]"
        style={{
          width: `calc(${100 / count}% - 2px)`,
          background: 'var(--surface)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
        animate={{
          x: activeIdx === 0
            ? 2
            : `calc(${activeIdx * 100}% + ${activeIdx * 2}px)`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="relative z-10 flex h-full items-center justify-center px-3 font-mono text-xs font-medium transition-colors duration-150"
          style={{
            color: value === opt.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
            minWidth: '3rem',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function HtmlJsxControlBar({
  outputFormat,
  onOutputFormatChange,
  componentWrapper,
  onComponentWrapperChange,
  selfClosingStyle,
  onSelfClosingStyleChange,
  quoteStyle,
  onQuoteStyleChange,
}: HtmlJsxControlBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Output format toggle */}
      <SegmentToggle
        value={outputFormat}
        options={[
          { value: 'jsx', label: '.jsx' },
          { value: 'tsx', label: '.tsx' },
        ]}
        onChange={onOutputFormatChange}
      />

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Component wrapper */}
      <Select
        value={componentWrapper}
        onValueChange={(v) => onComponentWrapperChange(v as ComponentWrapper)}
      >
        <SelectTrigger
          className="h-8 w-[170px] rounded-md border text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{{ none: 'No Wrapper', function: 'Function Component', arrow: 'Arrow Component' }[componentWrapper]}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Wrapper</SelectItem>
          <SelectItem value="function">Function Component</SelectItem>
          <SelectItem value="arrow">Arrow Component</SelectItem>
        </SelectContent>
      </Select>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Self-closing toggle */}
      <SegmentToggle
        value={selfClosingStyle}
        options={[
          { value: 'always', label: 'Self-close' },
          { value: 'original', label: 'Original' },
        ]}
        onChange={onSelfClosingStyleChange}
      />

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Quote style toggle */}
      <SegmentToggle
        value={quoteStyle}
        options={[
          { value: 'double', label: '"double"' },
          { value: 'single', label: "'single'" },
        ]}
        onChange={onQuoteStyleChange}
      />
    </div>
  );
}
