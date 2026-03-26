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
import type { PropTypesToTsOptions } from '@/lib/types';

interface ControlBarProps {
  options: PropTypesToTsOptions;
  onOptionsChange: (options: PropTypesToTsOptions) => void;
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

export function PropTypesToTsControlBar({
  options,
  onOptionsChange,
  onConvert,
  isConverting,
}: ControlBarProps) {
  const update = (partial: Partial<PropTypesToTsOptions>) =>
    onOptionsChange({ ...options, ...partial });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center gap-3 py-2">
        {/* Output mode */}
        <Select
          value={options.outputMode}
          onValueChange={(v) => update({ outputMode: v as PropTypesToTsOptions['outputMode'] })}
        >
          <SelectTrigger
            className="h-8 w-[180px] rounded-md border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <span>{options.outputMode === 'interface-only' ? 'Interface only' : 'Interface + Component'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interface-only">Interface only</SelectItem>
            <SelectItem value="interface-and-component">Interface + Component</SelectItem>
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
          label="Merge defaultProps"
          checked={options.defaultPropsHandling === 'merge-optional'}
          onChange={(v) => update({ defaultPropsHandling: v ? 'merge-optional' : 'keep-separate' })}
        />
        <OptionSwitch
          label="Infer event types"
          checked={options.functionTypes === 'event-inference'}
          onChange={(v) => update({ functionTypes: v ? 'event-inference' : 'generic' })}
          disabled={false}
        />
      </div>
    </motion.div>
  );
}
