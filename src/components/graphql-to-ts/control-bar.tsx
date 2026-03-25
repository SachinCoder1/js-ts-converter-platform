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
import type { AIProvider, GraphqlToTsOptions } from '@/lib/types';

interface ControlBarProps {
  options: GraphqlToTsOptions;
  onOptionsChange: (options: GraphqlToTsOptions) => void;
  selectedProvider: AIProvider | 'auto';
  onProviderChange: (provider: AIProvider | 'auto') => void;
  onConvert: () => void;
  isConverting: boolean;
}

function OptionSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors duration-150"
      style={{
        background: checked
          ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
          : 'var(--muted)',
        color: checked ? 'var(--primary)' : 'var(--text-tertiary)',
        border: `1px solid ${checked ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--border)'}`,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

export function GraphqlToTsControlBar({
  options,
  onOptionsChange,
  selectedProvider,
  onProviderChange,
  onConvert,
  isConverting,
}: ControlBarProps) {
  const update = (partial: Partial<GraphqlToTsOptions>) =>
    onOptionsChange({ ...options, ...partial });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center gap-3 py-2">
        {/* Enum style */}
        <Select
          value={options.enumStyle}
          onValueChange={(v) => update({ enumStyle: v as 'enum' | 'union' })}
        >
          <SelectTrigger
            className="h-8 w-[150px] rounded-md border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enum">TS enum</SelectItem>
            <SelectItem value="union">Union type</SelectItem>
          </SelectContent>
        </Select>

        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <ConvertButton onClick={onConvert} isConverting={isConverting} />

        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <ProviderSelector value={selectedProvider} onChange={onProviderChange} />

        <KeyboardShortcutHint />
      </div>

      {/* Second row — toggle options */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <OptionSwitch
          label={options.nullableStyle === 'maybe' ? 'Maybe<T>' : '| null'}
          checked={options.nullableStyle === 'maybe'}
          onChange={(v) => update({ nullableStyle: v ? 'maybe' : 'null' })}
        />
        <OptionSwitch
          label="Export all"
          checked={options.exportAll}
          onChange={(v) => update({ exportAll: v })}
        />
        <OptionSwitch
          label="Readonly"
          checked={options.readonlyProperties}
          onChange={(v) => update({ readonlyProperties: v })}
        />
      </div>
    </motion.div>
  );
}
