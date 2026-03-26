'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { EnvToTypesOptions } from '@/lib/env-to-types';

interface EnvToTypesControlBarProps {
  options: EnvToTypesOptions;
  onOptionsChange: (options: EnvToTypesOptions) => void;
}

export function EnvToTypesControlBar({ options, onOptionsChange }: EnvToTypesControlBarProps) {
  const update = <K extends keyof EnvToTypesOptions>(key: K, value: EnvToTypesOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Output format */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Format
        </span>
        <Select
          value={options.outputFormat}
          onValueChange={(v) => update('outputFormat', v as EnvToTypesOptions['outputFormat'])}
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
            <SelectItem value="typescript">TypeScript interface</SelectItem>
            <SelectItem value="zod">Zod schema</SelectItem>
            <SelectItem value="t3-env">t3-env config</SelectItem>
            <SelectItem value="valibot">Valibot schema</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Optional mode */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Optional
        </span>
        <Select
          value={options.optionalMode}
          onValueChange={(v) => update('optionalMode', v as EnvToTypesOptions['optionalMode'])}
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
            <SelectItem value="all-required">All required</SelectItem>
            <SelectItem value="empty-optional">Empty → optional</SelectItem>
            <SelectItem value="all-optional">All optional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Add comments toggle */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Comments
        </span>
        <Switch
          checked={options.addComments}
          onCheckedChange={(checked) => update('addComments', checked as boolean)}
          size="sm"
        />
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Prefix detection */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Prefix split
        </span>
        <Switch
          checked={options.prefixDetection === 'auto'}
          onCheckedChange={(checked) => update('prefixDetection', checked ? 'auto' : 'none')}
          size="sm"
        />
      </div>
    </div>
  );
}
