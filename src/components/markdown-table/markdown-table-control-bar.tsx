'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { MarkdownTableOptions, DetectedFormat } from '@/lib/markdown-table-converter';

interface MarkdownTableControlBarProps {
  options: MarkdownTableOptions;
  onOptionsChange: (options: MarkdownTableOptions) => void;
  activeTab: 'output1' | 'output2';
  onTabChange: (tab: 'output1' | 'output2') => void;
  output1Format: DetectedFormat;
  output2Format: DetectedFormat;
}

const FORMAT_LABELS: Record<DetectedFormat, string> = {
  markdown: 'Markdown',
  json: 'JSON',
  csv: 'CSV',
};

export function MarkdownTableControlBar({
  options,
  onOptionsChange,
  activeTab,
  onTabChange,
  output1Format,
  output2Format,
}: MarkdownTableControlBarProps) {
  const update = <K extends keyof MarkdownTableOptions>(key: K, value: MarkdownTableOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Output tab switcher */}
      <div
        className="flex rounded-md p-0.5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <button
          onClick={() => onTabChange('output1')}
          className="px-3 py-1 rounded text-[11px] font-medium transition-colors"
          style={{
            background: activeTab === 'output1' ? 'var(--surface)' : 'transparent',
            color: activeTab === 'output1' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: activeTab === 'output1' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {FORMAT_LABELS[output1Format]}
        </button>
        <button
          onClick={() => onTabChange('output2')}
          className="px-3 py-1 rounded text-[11px] font-medium transition-colors"
          style={{
            background: activeTab === 'output2' ? 'var(--surface)' : 'transparent',
            color: activeTab === 'output2' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: activeTab === 'output2' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {FORMAT_LABELS[output2Format]}
        </button>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Input format */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Input
        </span>
        <Select
          value={options.inputFormat}
          onValueChange={(v) => update('inputFormat', v as MarkdownTableOptions['inputFormat'])}
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
            <SelectItem value="auto">Auto-detect</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* JSON style */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          JSON
        </span>
        <Select
          value={options.jsonStyle}
          onValueChange={(v) => update('jsonStyle', v as MarkdownTableOptions['jsonStyle'])}
        >
          <SelectTrigger
            className="h-8 w-[150px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="array-of-objects">Array of objects</SelectItem>
            <SelectItem value="array-of-arrays">Array of arrays</SelectItem>
            <SelectItem value="nested">Nested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* CSV delimiter */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Delimiter
        </span>
        <Select
          value={options.csvDelimiter}
          onValueChange={(v) => update('csvDelimiter', v as MarkdownTableOptions['csvDelimiter'])}
        >
          <SelectTrigger
            className="h-8 w-[110px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=",">Comma</SelectItem>
            <SelectItem value={'\t'}>Tab</SelectItem>
            <SelectItem value=";">Semicolon</SelectItem>
            <SelectItem value="|">Pipe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Markdown alignment */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Align
        </span>
        <Select
          value={options.markdownAlignment}
          onValueChange={(v) => update('markdownAlignment', v as MarkdownTableOptions['markdownAlignment'])}
        >
          <SelectTrigger
            className="h-8 w-[110px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="auto">Auto-detect</SelectItem>
            <SelectItem value="center">Center</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Pretty print toggle */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Pretty print
        </span>
        <Switch
          checked={options.prettyPrint}
          onCheckedChange={(checked) => update('prettyPrint', checked as boolean)}
          size="sm"
        />
      </div>
    </div>
  );
}
