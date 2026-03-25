'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { IndentOption, UndefinedHandling, SortKeys } from '@/lib/js-to-json/types';

interface JsToJsonOptionsBarProps {
  indent: IndentOption;
  onIndentChange: (value: IndentOption) => void;
  undefinedHandling: UndefinedHandling;
  onUndefinedHandlingChange: (value: UndefinedHandling) => void;
  sortKeys: SortKeys;
  onSortKeysChange: (value: SortKeys) => void;
}

export function JsToJsonOptionsBar({
  indent,
  onIndentChange,
  undefinedHandling,
  onUndefinedHandlingChange,
  sortKeys,
  onSortKeysChange,
}: JsToJsonOptionsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Indent selector */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}
        >
          Indent
        </span>
        <Select
          value={indent}
          onValueChange={(v) => onIndentChange(v as IndentOption)}
        >
          <SelectTrigger
            className="h-8 w-[120px] rounded-md border text-xs"
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
            <SelectItem value="tab">Tab</SelectItem>
            <SelectItem value="minified">Minified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Undefined handling */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}
        >
          undefined
        </span>
        <Select
          value={undefinedHandling}
          onValueChange={(v) => onUndefinedHandlingChange(v as UndefinedHandling)}
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
            <SelectItem value="remove">Remove key</SelectItem>
            <SelectItem value="null">Convert to null</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Sort keys toggle */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}
        >
          Sort keys
        </span>
        <Switch
          size="sm"
          checked={sortKeys === 'alphabetical'}
          onCheckedChange={(checked) => onSortKeysChange(checked ? 'alphabetical' : 'off')}
        />
      </div>

      {/* Live indicator */}
      <span
        className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono"
        style={{ color: 'var(--text-disabled)', letterSpacing: '0.05em' }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--success)',
            boxShadow: '0 0 4px color-mix(in srgb, var(--success) 50%, transparent)',
          }}
        />
        Live
      </span>
    </div>
  );
}
