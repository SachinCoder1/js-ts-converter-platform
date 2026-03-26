'use client';

import { motion } from 'framer-motion';
import { PoweredByIndicator, KeyboardShortcutHint } from '@/components/shared/provider-selector';
import type { FileType } from '@/lib/types';

interface ControlBarProps {
  fileType: FileType;
  onFileTypeChange: (fileType: FileType) => void;
  onConvert: () => void;
  isConverting: boolean;
  providerStatus?: string;
}

/* ─── File type toggle  iOS-style segment control ─── */
function FileTypeToggle({
  value,
  onChange,
}: {
  value: FileType;
  onChange: (v: FileType) => void;
}) {
  return (
    <div
      className="relative flex h-8 rounded-md p-0.5"
      style={{ background: 'var(--muted)' }}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-[5px]"
        style={{
          width: 'calc(50% - 2px)',
          background: 'var(--surface)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
        animate={{ x: value === 'js' ? 2 : 'calc(100% + 2px)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      {(['js', 'jsx'] as const).map((ft) => (
        <button
          key={ft}
          onClick={() => onChange(ft)}
          className="relative z-10 flex h-full w-14 items-center justify-center font-mono text-xs font-medium transition-colors duration-150"
          style={{
            color: value === ft ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}
        >
          .{ft}
        </button>
      ))}
    </div>
  );
}

/* ─── The Convert Button  the star of the show ─── */
function ConvertButton({
  onClick,
  isConverting,
  providerStatus,
}: {
  onClick: () => void;
  isConverting: boolean;
  providerStatus?: string;
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
            {providerStatus || 'Converting...'}
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

export function ControlBar({
  fileType,
  onFileTypeChange,
  onConvert,
  isConverting,
  providerStatus,
}: ControlBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <FileTypeToggle value={fileType} onChange={onFileTypeChange} />

      {/* Subtle separator */}
      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      <ConvertButton
        onClick={onConvert}
        isConverting={isConverting}
        providerStatus={providerStatus}
      />

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      <PoweredByIndicator />

      <KeyboardShortcutHint />
    </div>
  );
}
