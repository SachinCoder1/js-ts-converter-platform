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
import type { SqlToTsOptions } from '@/lib/types';

interface ControlBarProps {
  options: SqlToTsOptions;
  onOptionsChange: (options: SqlToTsOptions) => void;
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

export function SqlToTsControlBar({
  options,
  onOptionsChange,
  onConvert,
  isConverting,
}: ControlBarProps) {
  const update = (partial: Partial<SqlToTsOptions>) =>
    onOptionsChange({ ...options, ...partial });

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center gap-3 py-2">
        {/* SQL Dialect */}
        <Select
          value={options.dialect}
          onValueChange={(v) => update({ dialect: v as SqlToTsOptions['dialect'] })}
        >
          <SelectTrigger
            className="h-8 w-[140px] rounded-md border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <span>{{ postgresql: 'PostgreSQL', mysql: 'MySQL', sqlite: 'SQLite' }[options.dialect]}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="sqlite">SQLite</SelectItem>
          </SelectContent>
        </Select>

        {/* Output Format */}
        <Select
          value={options.outputFormat}
          onValueChange={(v) => update({ outputFormat: v as SqlToTsOptions['outputFormat'] })}
        >
          <SelectTrigger
            className="h-8 w-[140px] rounded-md border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}
          >
            <span>{{ interfaces: 'TS Interfaces', prisma: 'Prisma', drizzle: 'Drizzle' }[options.outputFormat]}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interfaces">TS Interfaces</SelectItem>
            <SelectItem value="prisma">Prisma</SelectItem>
            <SelectItem value="drizzle">Drizzle</SelectItem>
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
          label={options.dateHandling === 'date-object' ? 'Date object' : 'string dates'}
          checked={options.dateHandling === 'date-object'}
          onChange={(v) => update({ dateHandling: v ? 'date-object' : 'string' })}
        />
        <OptionSwitch
          label={options.nullableStyle === 'union-null' ? '| null' : 'optional?'}
          checked={options.nullableStyle === 'optional'}
          onChange={(v) => update({ nullableStyle: v ? 'optional' : 'union-null' })}
        />
        <OptionSwitch
          label="Select + Insert"
          checked={options.generateMode === 'select-insert'}
          onChange={(v) => update({ generateMode: v ? 'select-insert' : 'select-only' })}
        />
      </div>
    </motion.div>
  );
}
