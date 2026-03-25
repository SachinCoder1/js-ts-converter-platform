'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { JsonToYamlOptions } from '@/lib/json-to-yaml';

interface JsonYamlControlBarProps {
  options: JsonToYamlOptions;
  onOptionsChange: (options: JsonToYamlOptions) => void;
}

export function JsonYamlControlBar({ options, onOptionsChange }: JsonYamlControlBarProps) {
  const update = <K extends keyof JsonToYamlOptions>(key: K, value: JsonToYamlOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Indent size */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Indent
        </span>
        <Select
          value={String(options.indent)}
          onValueChange={(v) => update('indent', Number(v) as 2 | 4 | 8)}
        >
          <SelectTrigger
            className="h-8 w-[90px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 spaces</SelectItem>
            <SelectItem value="4">4 spaces</SelectItem>
            <SelectItem value="8">8 spaces</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Flow level */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Style
        </span>
        <Select
          value={String(options.flowLevel)}
          onValueChange={(v) => update('flowLevel', Number(v) as -1 | 2)}
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
            <SelectItem value="-1">Block style</SelectItem>
            <SelectItem value="2">Inline compact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Quote strings toggle */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Quote strings
        </span>
        <Switch
          checked={options.forceQuotes}
          onCheckedChange={(checked) => update('forceQuotes', checked as boolean)}
          size="sm"
        />
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Sort keys toggle */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Sort keys
        </span>
        <Switch
          checked={options.sortKeys}
          onCheckedChange={(checked) => update('sortKeys', checked as boolean)}
          size="sm"
        />
      </div>
    </div>
  );
}
