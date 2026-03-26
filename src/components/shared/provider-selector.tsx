'use client';

import { useIsMac } from '@/hooks/use-is-mac';

export function PoweredByIndicator() {
  return (
    <span
      className="hidden sm:flex items-center gap-1.5 text-[11px]"
      style={{ color: 'var(--text-tertiary)' }}
    >
      Powered by Gemini &amp; GPT
    </span>
  );
}

export function KeyboardShortcutHint() {
  const isMac = useIsMac();
  return (
    <span
      className="hidden sm:flex items-center gap-1 text-[10px] font-mono"
      style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}
    >
      <kbd
        className="rounded px-1.5 py-0.5"
        style={{ background: 'var(--muted)', color: 'var(--text-tertiary)' }}
      >
        {isMac ? '\u2318' : 'Ctrl'}
      </kbd>
      <span>+</span>
      <kbd
        className="rounded px-1.5 py-0.5"
        style={{ background: 'var(--muted)', color: 'var(--text-tertiary)' }}
      >
        Enter
      </kbd>
    </span>
  );
}
