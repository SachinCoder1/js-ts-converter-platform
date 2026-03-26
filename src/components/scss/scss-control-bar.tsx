'use client';

import { motion } from 'framer-motion';
import { useIsMac } from '@/hooks/use-is-mac';
import type { ScssSyntax, ScssOutputStyle } from '@/lib/types';

interface ScssControlBarProps {
  syntax: ScssSyntax;
  onSyntaxChange: (syntax: ScssSyntax) => void;
  outputStyle: ScssOutputStyle;
  onOutputStyleChange: (style: ScssOutputStyle) => void;
  onConvert: () => void;
  isConverting: boolean;
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
  const activeIndex = options.findIndex((o) => o.value === value);

  return (
    <div
      className="relative flex h-8 rounded-md p-0.5"
      style={{ background: 'var(--muted)' }}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-[5px]"
        style={{
          width: `calc(${100 / options.length}% - 2px)`,
          background: 'var(--surface)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
        animate={{
          x:
            activeIndex === 0
              ? 2
              : `calc(${activeIndex * 100}% + 2px)`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="relative z-10 flex h-full items-center justify-center px-3 font-mono text-xs font-medium transition-colors duration-150"
          style={{
            color:
              value === opt.value
                ? 'var(--text-primary)'
                : 'var(--text-tertiary)',
            minWidth: '52px',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Compile Button ─── */
function CompileButton({
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
      {/* Shimmer sweep on loading */}
      {isConverting && (
        <div
          className="shimmer absolute inset-0 z-0"
          style={{ pointerEvents: 'none' }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {isConverting ? (
          <span className="text-xs font-medium" style={{ opacity: 0.9 }}>
            Compiling...
          </span>
        ) : (
          <>
            Compile
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

export function ScssControlBar({
  syntax,
  onSyntaxChange,
  outputStyle,
  onOutputStyleChange,
  onConvert,
  isConverting,
}: ScssControlBarProps) {
  const isMac = useIsMac();
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <SegmentToggle
        value={syntax}
        options={[
          { value: 'scss' as const, label: '.scss' },
          { value: 'sass' as const, label: '.sass' },
        ]}
        onChange={onSyntaxChange}
      />

      {/* Subtle separator */}
      <div
        className="hidden sm:block h-5 w-px"
        style={{ background: 'var(--border)' }}
      />

      <SegmentToggle
        value={outputStyle}
        options={[
          { value: 'expanded' as const, label: 'Expanded' },
          { value: 'compressed' as const, label: 'Compressed' },
        ]}
        onChange={onOutputStyleChange}
      />

      <div
        className="hidden sm:block h-5 w-px"
        style={{ background: 'var(--border)' }}
      />

      <CompileButton onClick={onConvert} isConverting={isConverting} />

      {/* Keyboard shortcut hint */}
      <span
        className="hidden sm:flex items-center gap-1 text-[10px] font-mono"
        style={{ color: 'var(--text-disabled)', letterSpacing: '0.05em' }}
      >
        <kbd
          className="rounded px-1.5 py-0.5"
          style={{
            background: 'var(--muted)',
            color: 'var(--text-tertiary)',
          }}
        >
          {isMac ? '\u2318' : 'Ctrl'}
        </kbd>
        <span>+</span>
        <kbd
          className="rounded px-1.5 py-0.5"
          style={{
            background: 'var(--muted)',
            color: 'var(--text-tertiary)',
          }}
        >
          Enter
        </kbd>
      </span>
    </div>
  );
}
