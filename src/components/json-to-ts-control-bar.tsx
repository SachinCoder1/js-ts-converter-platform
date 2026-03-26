'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ConvertButton } from '@/components/shared/convert-button';
import { PoweredByIndicator, KeyboardShortcutHint } from '@/components/shared/provider-selector';
import type { JsonToTsOptions, JsonOutputStyle, JsonOptionalFields } from '@/lib/types';

interface JsonToTsControlBarProps {
  options: JsonToTsOptions;
  onOptionsChange: (options: JsonToTsOptions) => void;
  onConvert: () => void;
  isConverting: boolean;
}

export function JsonToTsControlBar({
  options,
  onOptionsChange,
  onConvert,
  isConverting,
}: JsonToTsControlBarProps) {
  const update = (patch: Partial<JsonToTsOptions>) => {
    onOptionsChange({ ...options, ...patch });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Output style */}
      <Select
        value={options.outputStyle}
        onValueChange={(v) => update({ outputStyle: v as JsonOutputStyle })}
      >
        <SelectTrigger
          className="h-8 w-[120px] rounded-md border text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{options.outputStyle === 'interface' ? 'interface' : 'type alias'}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="interface">interface</SelectItem>
          <SelectItem value="type">type alias</SelectItem>
        </SelectContent>
      </Select>

      {/* Export toggle */}
      <label
        className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Switch
          size="sm"
          checked={options.exportKeyword}
          onCheckedChange={(checked: boolean) => update({ exportKeyword: checked })}
        />
        export
      </label>

      {/* Readonly toggle */}
      <label
        className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Switch
          size="sm"
          checked={options.readonlyProperties}
          onCheckedChange={(checked: boolean) => update({ readonlyProperties: checked })}
        />
        readonly
      </label>

      {/* Optional fields */}
      <Select
        value={options.optionalFields}
        onValueChange={(v) => update({ optionalFields: v as JsonOptionalFields })}
      >
        <SelectTrigger
          className="h-8 w-[130px] rounded-md border text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>{{ required: 'All required', optional: 'All optional', smart: 'Smart (AI)' }[options.optionalFields]}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="required">All required</SelectItem>
          <SelectItem value="optional">All optional</SelectItem>
          <SelectItem value="smart">Smart (AI)</SelectItem>
        </SelectContent>
      </Select>

      {/* Root type name */}
      <input
        type="text"
        value={options.rootTypeName}
        onChange={(e) => {
          const val = e.target.value;
          if (val.length <= 50) {
            update({ rootTypeName: val });
          }
        }}
        placeholder="Root"
        className="h-8 w-[100px] rounded-md border px-2 font-mono text-xs outline-none transition-colors duration-150 focus:ring-1"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
        }}
        spellCheck={false}
      />

      {/* Separator */}
      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      <ConvertButton
        onClick={onConvert}
        isConverting={isConverting}
        label="Generate"
      />

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      <PoweredByIndicator />

      <KeyboardShortcutHint />
    </div>
  );
}
