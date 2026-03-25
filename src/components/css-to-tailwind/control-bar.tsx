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
import { ProviderSelector, KeyboardShortcutHint } from '@/components/shared/provider-selector';
import type { AIProvider, CssToTailwindOptions } from '@/lib/types';

interface ControlBarProps {
  options: CssToTailwindOptions;
  onOptionsChange: (options: CssToTailwindOptions) => void;
  selectedProvider: AIProvider | 'auto';
  onProviderChange: (provider: AIProvider | 'auto') => void;
  onConvert: () => void;
  isConverting: boolean;
}

export function CssToTailwindControlBar({
  options,
  onOptionsChange,
  selectedProvider,
  onProviderChange,
  onConvert,
  isConverting,
}: ControlBarProps) {
  const update = (partial: Partial<CssToTailwindOptions>) =>
    onOptionsChange({ ...options, ...partial });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center gap-3 py-2">
        {/* Tailwind version */}
        <Select
          value={options.tailwindVersion}
          onValueChange={(v) => update({ tailwindVersion: v as 'v3' | 'v4' })}
        >
          <SelectTrigger
            className="h-8 w-[100px] rounded-md border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="v3">Tailwind v3</SelectItem>
            <SelectItem value="v4">Tailwind v4</SelectItem>
          </SelectContent>
        </Select>

        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <ConvertButton onClick={onConvert} isConverting={isConverting} />

        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <ProviderSelector value={selectedProvider} onChange={onProviderChange} />

        <KeyboardShortcutHint />
      </div>

      {/* Second row — options */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {/* Arbitrary values */}
        <Select
          value={options.arbitraryValues}
          onValueChange={(v) => update({ arbitraryValues: v as 'allow' | 'closest-match' })}
        >
          <SelectTrigger
            className="h-7 w-[140px] rounded-md border text-[11px]"
            style={{ borderColor: 'var(--border)', background: 'var(--muted)', color: 'var(--text-tertiary)' }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="allow">Allow [custom]</SelectItem>
            <SelectItem value="closest-match">Closest match</SelectItem>
          </SelectContent>
        </Select>

        {/* Output format */}
        <Select
          value={options.outputFormat}
          onValueChange={(v) => update({ outputFormat: v as 'classes-only' | 'html-structure' | 'apply' })}
        >
          <SelectTrigger
            className="h-7 w-[130px] rounded-md border text-[11px]"
            style={{ borderColor: 'var(--border)', background: 'var(--muted)', color: 'var(--text-tertiary)' }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classes-only">Classes only</SelectItem>
            <SelectItem value="html-structure">HTML structure</SelectItem>
            <SelectItem value="apply">@apply syntax</SelectItem>
          </SelectContent>
        </Select>

        {/* Color format */}
        <Select
          value={options.colorFormat}
          onValueChange={(v) => update({ colorFormat: v as 'named' | 'arbitrary-hex' })}
        >
          <SelectTrigger
            className="h-7 w-[130px] rounded-md border text-[11px]"
            style={{ borderColor: 'var(--border)', background: 'var(--muted)', color: 'var(--text-tertiary)' }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="named">Named colors</SelectItem>
            <SelectItem value="arbitrary-hex">Arbitrary hex</SelectItem>
          </SelectContent>
        </Select>

        {/* Prefix */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Prefix:
          </span>
          <input
            type="text"
            value={options.prefix}
            onChange={(e) => update({ prefix: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '') })}
            className="h-7 w-20 rounded-md border px-2 text-xs font-mono"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              outline: 'none',
            }}
            placeholder="none"
          />
        </div>
      </div>
    </motion.div>
  );
}
