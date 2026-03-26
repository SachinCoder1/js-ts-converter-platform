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
import type { JsonToZodOptions } from '@/lib/types';

interface ControlBarProps {
  options: JsonToZodOptions;
  onOptionsChange: (options: JsonToZodOptions) => void;
  onConvert: () => void;
  isConverting: boolean;
}

function OptionSwitch({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors duration-150"
      style={{
        background: checked
          ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
          : 'var(--muted)',
        color: disabled
          ? 'var(--text-disabled)'
          : checked
            ? 'var(--primary)'
            : 'var(--text-tertiary)',
        border: `1px solid ${checked ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'var(--border)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

export function JsonToZodControlBar({
  options,
  onOptionsChange,
  onConvert,
  isConverting,
}: ControlBarProps) {
  const update = (partial: Partial<JsonToZodOptions>) =>
    onOptionsChange({ ...options, ...partial });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center gap-3 py-2">
        {/* Import style */}
        <Select
          value={options.importStyle}
          onValueChange={(v) => update({ importStyle: v as 'import' | 'require' })}
        >
          <SelectTrigger
            className="h-8 w-[150px] rounded-md border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <span>{options.importStyle === 'import' ? 'import { z }' : "require('zod')"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="import">import &#123; z &#125;</SelectItem>
            <SelectItem value="require">require(&apos;zod&apos;)</SelectItem>
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
        <OptionSwitch
          label="Descriptions"
          checked={options.addDescriptions}
          onChange={(v) => update({ addDescriptions: v })}
          disabled={false}
        />
        <OptionSwitch
          label="Coerce dates"
          checked={options.coerceDates}
          onChange={(v) => update({ coerceDates: v })}
        />
        <OptionSwitch
          label="Inferred type"
          checked={options.generateInferredType}
          onChange={(v) => update({ generateInferredType: v })}
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Name:
          </span>
          <input
            type="text"
            value={options.schemaVariableName}
            onChange={(e) => update({ schemaVariableName: e.target.value.replace(/[^a-zA-Z0-9_$]/g, '') || 'schema' })}
            className="h-7 w-24 rounded-md border px-2 text-xs font-mono"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              outline: 'none',
            }}
            placeholder="schema"
          />
        </div>
      </div>
    </motion.div>
  );
}
