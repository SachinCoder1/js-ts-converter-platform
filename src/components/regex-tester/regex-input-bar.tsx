'use client';

import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConvertButton } from '@/components/shared/convert-button';
import { PoweredByIndicator, KeyboardShortcutHint } from '@/components/shared/provider-selector';
import type { RegexFlavor, RegexFlag } from '@/lib/types';

interface CommonPattern {
  label: string;
  pattern: string;
  testString: string;
  flags: string;
}

const COMMON_PATTERNS: CommonPattern[] = [
  { label: 'Date (YYYY-MM-DD)', pattern: String.raw`(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})`, testString: 'Meeting on 2024-03-15, deadline 2024-06-30, launched 2023-12-01', flags: 'g' },
  { label: 'Email', pattern: String.raw`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`, testString: 'Contact us at user@example.com or admin@test.org', flags: 'g' },
  { label: 'URL', pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*`, testString: 'Visit https://example.com or http://test.org/path?q=1', flags: 'g' },
  { label: 'Phone (US)', pattern: String.raw`\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`, testString: 'Call (555) 123-4567 or 555.987.6543', flags: 'g' },
  { label: 'IPv4', pattern: String.raw`\b(?:\d{1,3}\.){3}\d{1,3}\b`, testString: 'Server IPs: 192.168.1.1, 10.0.0.255, 172.16.0.1', flags: 'g' },
  { label: 'Hex Color', pattern: String.raw`#(?:[0-9a-fA-F]{3}){1,2}\b`, testString: 'Colors: #fff, #FF5733, #00cc99, #123', flags: 'gi' },
];

const ALL_FLAGS: RegexFlag[] = ['g', 'i', 'm', 's', 'u', 'y'];

const FLAVOR_OPTIONS: { value: RegexFlavor; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'java', label: 'Java' },
];

interface RegexInputBarProps {
  pattern: string;
  onPatternChange: (pattern: string) => void;
  flags: Set<RegexFlag>;
  onFlagsChange: (flags: Set<RegexFlag>) => void;
  onTestStringChange: (testString: string) => void;
  sourceFlavor: RegexFlavor;
  onSourceFlavorChange: (flavor: RegexFlavor) => void;
  onExplain: () => void;
  isExplaining: boolean;
  isRateLimited: boolean;
  regexError: string | null;
}

export function RegexInputBar({
  pattern,
  onPatternChange,
  flags,
  onFlagsChange,
  onTestStringChange,
  sourceFlavor,
  onSourceFlavorChange,
  onExplain,
  isExplaining,
  isRateLimited,
  regexError,
}: RegexInputBarProps) {
  const flagsString = Array.from(flags).join('');

  const toggleFlag = (flag: RegexFlag) => {
    const next = new Set(flags);
    if (next.has(flag)) {
      next.delete(flag);
    } else {
      next.add(flag);
    }
    onFlagsChange(next);
  };

  const handleCommonPattern = (value: string) => {
    const preset = COMMON_PATTERNS.find(p => p.label === value);
    if (preset) {
      onPatternChange(preset.pattern);
      onTestStringChange(preset.testString);
      const newFlags = new Set<RegexFlag>();
      for (const ch of preset.flags) {
        if (ALL_FLAGS.includes(ch as RegexFlag)) {
          newFlags.add(ch as RegexFlag);
        }
      }
      onFlagsChange(newFlags);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-2 py-2"
    >
      {/* Regex input row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className="flex items-center flex-1 min-w-[200px] h-9 rounded-md overflow-hidden"
          style={{
            border: regexError ? '1px solid var(--error)' : '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <span
            className="flex items-center justify-center w-6 h-full font-mono text-sm shrink-0"
            style={{ color: 'var(--text-tertiary)' }}
          >
            /
          </span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 h-full bg-transparent font-mono text-sm outline-none min-w-0"
            style={{ color: 'var(--text-primary)' }}
            spellCheck={false}
            autoComplete="off"
          />
          <span
            className="flex items-center justify-center px-2 h-full font-mono text-sm shrink-0"
            style={{ color: 'var(--text-tertiary)' }}
          >
            /{flagsString}
          </span>
        </div>

        {/* Flag toggles */}
        <div className="flex items-center gap-1">
          {ALL_FLAGS.map((flag) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className="flex items-center justify-center w-7 h-7 rounded text-xs font-mono font-semibold transition-colors duration-150"
              style={{
                background: flags.has(flag) ? 'var(--primary)' : 'var(--muted)',
                color: flags.has(flag) ? 'var(--primary-foreground)' : 'var(--text-tertiary)',
              }}
              title={getFlagDescription(flag)}
              aria-label={`Flag ${flag}: ${getFlagDescription(flag)}`}
              aria-pressed={flags.has(flag)}
            >
              {flag}
            </button>
          ))}
        </div>

        <ConvertButton
          onClick={onExplain}
          isConverting={isExplaining || isRateLimited}
          label="Explain"
          providerStatus={isExplaining ? 'Explaining...' : undefined}
        />
      </div>

      {/* Options row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value="placeholder" onValueChange={(v) => v && handleCommonPattern(v)}>
          <SelectTrigger
            className="h-8 w-[180px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <SelectValue placeholder="Common patterns..." />
          </SelectTrigger>
          <SelectContent>
            {COMMON_PATTERNS.map((p) => (
              <SelectItem key={p.label} value={p.label}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sourceFlavor}
          onValueChange={(v) => v && onSourceFlavorChange(v as RegexFlavor)}
        >
          <SelectTrigger
            className="h-8 w-[140px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FLAVOR_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <PoweredByIndicator />
        <KeyboardShortcutHint />
      </div>

      {/* Regex error */}
      {regexError && (
        <p
          className="text-xs font-mono px-1"
          style={{ color: 'var(--error)' }}
        >
          {regexError}
        </p>
      )}
    </motion.div>
  );
}

function getFlagDescription(flag: RegexFlag): string {
  const descriptions: Record<RegexFlag, string> = {
    g: 'Global  find all matches',
    i: 'Case insensitive',
    m: 'Multiline  ^ and $ match line boundaries',
    s: 'Dotall  . matches newlines',
    u: 'Unicode  enable unicode support',
    y: 'Sticky  match from lastIndex',
  };
  return descriptions[flag];
}
