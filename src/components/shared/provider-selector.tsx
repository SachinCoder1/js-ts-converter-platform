'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AIProvider } from '@/lib/types';

interface ProviderSelectorProps {
  value: AIProvider | 'auto';
  onChange: (value: AIProvider | 'auto') => void;
}

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as AIProvider | 'auto')}
    >
      <SelectTrigger
        className="h-8 w-[160px] rounded-md border text-xs"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-secondary)',
        }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto (Best Available)</SelectItem>
        <SelectItem value="gemini">Gemini</SelectItem>
        <SelectItem value="deepseek">DeepSeek</SelectItem>
        <SelectItem value="openrouter">OpenRouter Free</SelectItem>
        <SelectItem value="ast-only">AST Only (No AI)</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function KeyboardShortcutHint() {
  return (
    <span
      className="hidden sm:flex items-center gap-1 text-[10px] font-mono"
      style={{ color: 'var(--text-disabled)', letterSpacing: '0.05em' }}
    >
      <kbd
        className="rounded px-1.5 py-0.5"
        style={{ background: 'var(--muted)', color: 'var(--text-tertiary)' }}
      >
        {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}
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
