'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { YamlToJsonOptions } from '@/lib/yaml-to-json';

interface YamlJsonControlBarProps {
  options: YamlToJsonOptions;
  onOptionsChange: (options: YamlToJsonOptions) => void;
}

export function YamlJsonControlBar({ options, onOptionsChange }: YamlJsonControlBarProps) {
  const update = <K extends keyof YamlToJsonOptions>(key: K, value: YamlToJsonOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Indent */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Indent
        </span>
        <Select
          value={String(options.indent)}
          onValueChange={(v) => update('indent', (v === 'tab' || v === 'minified' ? v : Number(v)) as YamlToJsonOptions['indent'])}
        >
          <SelectTrigger
            className="h-8 w-[110px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>{{ '2': '2 spaces', '4': '4 spaces', tab: 'Tab', minified: 'Minified' }[String(options.indent)]}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 spaces</SelectItem>
            <SelectItem value="4">4 spaces</SelectItem>
            <SelectItem value="tab">Tab</SelectItem>
            <SelectItem value="minified">Minified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Multi-document */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Multi-doc
        </span>
        <Select
          value={options.multiDocument}
          onValueChange={(v) => update('multiDocument', v as 'array' | 'separate')}
        >
          <SelectTrigger
            className="h-8 w-[155px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>{options.multiDocument === 'array' ? 'Combine into array' : 'Show separately'}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="array">Combine into array</SelectItem>
            <SelectItem value="separate">Show separately</SelectItem>
          </SelectContent>
        </Select>
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
