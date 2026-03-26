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
import type { OpenApiToTsOptions } from '@/lib/types';

interface ControlBarProps {
  options: OpenApiToTsOptions;
  onOptionsChange: (options: OpenApiToTsOptions) => void;
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

export function OpenApiToTsControlBar({
  options,
  onOptionsChange,
  onConvert,
  isConverting,
}: ControlBarProps) {
  const update = (partial: Partial<OpenApiToTsOptions>) =>
    onOptionsChange({ ...options, ...partial });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center gap-3 py-2">
        {/* Input format */}
        <Select
          value={options.inputFormat}
          onValueChange={(v) => update({ inputFormat: v as 'json' | 'yaml' })}
        >
          <SelectTrigger
            className="h-8 w-[110px] rounded-md border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <span>{options.inputFormat === 'json' ? 'JSON' : 'YAML'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="yaml">YAML</SelectItem>
          </SelectContent>
        </Select>

        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <ConvertButton onClick={onConvert} isConverting={isConverting} />

        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <PoweredByIndicator />

        <KeyboardShortcutHint />
      </div>

      {/* Second row  toggle options */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        <Select
          value={options.outputMode}
          onValueChange={(v) => update({ outputMode: v as OpenApiToTsOptions['outputMode'] })}
        >
          <SelectTrigger
            className="h-7 w-[160px] rounded-md border text-[11px]"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <span>{{ 'interfaces-only': 'Interfaces only', 'interfaces-and-client': '+ API client', 'interfaces-and-fetch': '+ Fetch wrappers' }[options.outputMode]}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interfaces-only">Interfaces only</SelectItem>
            <SelectItem value="interfaces-and-client">+ API client</SelectItem>
            <SelectItem value="interfaces-and-fetch">+ Fetch wrappers</SelectItem>
          </SelectContent>
        </Select>

        <OptionSwitch
          label={options.enumStyle === 'enum' ? 'TS enum' : 'Union type'}
          checked={options.enumStyle === 'enum'}
          onChange={(v) => update({ enumStyle: v ? 'enum' : 'union' })}
        />
        <OptionSwitch
          label="JSDoc"
          checked={options.addJsDoc}
          onChange={(v) => update({ addJsDoc: v })}
        />
      </div>
    </motion.div>
  );
}
