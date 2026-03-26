'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeEditor } from './code-editor';

interface EditorPanelProps {
  title: string;
  value: string;
  onChange?: (value: string) => void;
  language: string;
  readOnly?: boolean;
  fileType: string;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  downloadFileName?: string;
  isScanning?: boolean;
  emptyStateMessage?: string;
  emptyStateHint?: string;
  showCacheIndicator?: boolean;
}

const FILE_ICON_MAP: Record<string, { bg: string; fg: string; label: string }> = {
  TS:   { bg: 'hsl(210 75% 45%)', fg: 'hsl(210 75% 55%)', label: 'TS' },
  TSX:  { bg: 'hsl(210 75% 45%)', fg: 'hsl(210 75% 55%)', label: 'TS' },
  ZOD:  { bg: 'hsl(210 75% 45%)', fg: 'hsl(210 75% 55%)', label: 'ZD' },
  JS:   { bg: 'hsl(45 85% 50%)',  fg: 'hsl(45 85% 55%)',  label: 'JS' },
  JSX:  { bg: 'hsl(45 85% 50%)',  fg: 'hsl(45 85% 55%)',  label: 'JS' },
  CSS:  { bg: 'hsl(264 70% 50%)', fg: 'hsl(264 70% 60%)', label: 'CS' },
  TW:   { bg: 'hsl(190 80% 42%)', fg: 'hsl(190 80% 55%)', label: 'TW' },
  JSON: { bg: 'hsl(35 85% 45%)',  fg: 'hsl(35 85% 55%)',  label: '{}' },
  YAML: { bg: 'hsl(280 60% 50%)', fg: 'hsl(280 60% 60%)', label: 'YML' },
  SCSS: { bg: 'hsl(330 60% 50%)', fg: 'hsl(330 60% 60%)', label: 'SC' },
  SASS: { bg: 'hsl(330 60% 50%)', fg: 'hsl(330 60% 60%)', label: 'SA' },
  HTML: { bg: 'hsl(15 85% 50%)',  fg: 'hsl(15 85% 60%)',  label: 'HT' },
  GQL:  { bg: 'hsl(320 70% 50%)', fg: 'hsl(320 70% 60%)', label: 'GQ' },
  API:  { bg: 'hsl(145 60% 42%)', fg: 'hsl(145 60% 55%)', label: 'AP' },
  REGEX: { bg: 'hsl(160 70% 45%)', fg: 'hsl(160 70% 55%)', label: 'Rx' },
  CSV:  { bg: 'hsl(160 60% 45%)', fg: 'hsl(160 60% 55%)', label: 'CV' },
  MD:   { bg: 'hsl(160 60% 45%)', fg: 'hsl(160 60% 55%)', label: 'MD' },
  CURL: { bg: 'hsl(160 60% 42%)', fg: 'hsl(160 60% 55%)', label: '>' },
  SH:   { bg: 'hsl(120 20% 40%)', fg: 'hsl(120 20% 55%)', label: 'SH' },
  PY:   { bg: 'hsl(210 55% 50%)', fg: 'hsl(210 55% 60%)', label: 'PY' },
  GO:   { bg: 'hsl(190 70% 45%)', fg: 'hsl(190 70% 55%)', label: 'GO' },
  RS:   { bg: 'hsl(25 80% 50%)',  fg: 'hsl(25 80% 60%)',  label: 'RS' },
  PHP:  { bg: 'hsl(240 50% 55%)', fg: 'hsl(240 50% 65%)', label: 'PHP' },
  RB:   { bg: 'hsl(0 70% 50%)',   fg: 'hsl(0 70% 60%)',   label: 'RB' },
};

function FileIcon({ type }: { type: string }) {
  const c = FILE_ICON_MAP[type] || FILE_ICON_MAP['JS'];
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="14" height="14" rx="2" fill={c.bg} opacity="0.15" />
      <text x="8" y="11" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="var(--font-geist-mono)" fill={c.fg}>
        {c.label}
      </text>
    </svg>
  );
}

export function EditorPanel({
  title,
  value,
  onChange,
  language,
  readOnly = false,
  fileType,
  showCopyButton = false,
  showDownloadButton = false,
  downloadFileName = 'converted.ts',
  isScanning = false,
  emptyStateMessage,
  emptyStateHint,
  showCacheIndicator,
}: EditorPanelProps) {
  const lineCount = value ? value.split('\n').length : 0;
  const charCount = value.length;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [value, downloadFileName]);

  const fileName = title === 'Input'
    ? `input.${fileType.toLowerCase()}`
    : `output.${fileType.toLowerCase()}`;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderRadius: 0,
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), inset 0 0 0 1px var(--border)',
      }}
      role="region"
      aria-label={`${title} editor panel${readOnly ? ' (read only)' : ''}`}
    >
      {/* Scanning line effect */}
      {isScanning && <div className="scan-line absolute inset-0 z-10 pointer-events-none" />}

      {/* Panel header  file tab style */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--surface) 50%, var(--background))',
        }}
      >
        <div className="flex items-center gap-2">
          <FileIcon type={fileType} />
          <span
            className="font-mono text-xs font-medium"
            style={{ color: 'var(--text-secondary)', letterSpacing: '0.01em' }}
          >
            {fileName}
          </span>
          {showCacheIndicator && value && (
            <span title="Served from cache" style={{ color: 'var(--primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </span>
          )}
          <span
            className="hidden sm:inline font-mono text-[10px]"
            style={{ color: 'var(--text-disabled)', letterSpacing: '0.03em' }}
          >
            {lineCount} lines · {charCount >= 1000 ? `${(charCount / 1000).toFixed(1)}K` : charCount} chars
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {/* Copy button with morph animation */}
          {showCopyButton && value && (
            <button
              onClick={handleCopy}
              aria-label={copied ? 'Copied to clipboard' : 'Copy output to clipboard'}
              className="flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-all duration-150"
              style={{
                color: copied ? 'var(--success)' : 'var(--text-tertiary)',
                background: copied ? 'color-mix(in srgb, var(--success) 10%, transparent)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.svg
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </motion.svg>
                )}
              </AnimatePresence>
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          {/* Download button */}
          {showDownloadButton && value && (
            <motion.button
              onClick={handleDownload}
              whileTap={{ scale: 0.95 }}
              aria-label={`Download as ${downloadFileName}`}
              className="flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors duration-150"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              .{fileType.toLowerCase()}
            </motion.button>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 min-h-0">
        {!value && readOnly ? (
          /* Empty state for output panel */
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: 'var(--primary)',
                boxShadow: '0 0 8px var(--glow-strong)',
                animation: 'pulse 2s infinite',
              }}
            />
            <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {emptyStateMessage ?? 'TypeScript output will appear here'}
            </p>
            <div
              className="mt-2 rounded-md border border-dashed px-4 py-2 text-xs font-mono"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-disabled)',
              }}
            >
              {emptyStateHint ?? 'Paste code on the left, then hit Convert'}
            </div>
          </div>
        ) : (
          <CodeEditor
            value={value}
            onChange={onChange}
            language={language}
            readOnly={readOnly}
          />
        )}
      </div>

    </div>
  );
}
