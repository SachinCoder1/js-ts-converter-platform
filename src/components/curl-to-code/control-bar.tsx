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
import { LanguageTabs } from './language-tabs';
import type { CurlToCodeOptions, CurlCodeStyle, CurlErrorHandling, CurlVariableStyle } from '@/lib/types';

interface CurlToCodeControlBarProps {
  options: CurlToCodeOptions;
  onOptionsChange: (options: CurlToCodeOptions) => void;
  onConvert: () => void;
  isConverting: boolean;
}

export function CurlToCodeControlBar({
  options,
  onOptionsChange,
  onConvert,
  isConverting,
}: CurlToCodeControlBarProps) {
  const update = (patch: Partial<CurlToCodeOptions>) => {
    onOptionsChange({ ...options, ...patch });
  };

  const isJsTs = options.targetLanguage.startsWith('js-') || options.targetLanguage.startsWith('ts-');

  return (
    <div className="flex flex-col gap-2 py-2">
      {/* Row 1: Language tabs */}
      <LanguageTabs
        value={options.targetLanguage}
        onChange={(lang) => update({ targetLanguage: lang })}
      />

      {/* Row 2: Options */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Code style (only for JS/TS) */}
        {isJsTs && (
          <Select
            value={options.codeStyle}
            onValueChange={(v) => update({ codeStyle: v as CurlCodeStyle })}
          >
            <SelectTrigger
              className="h-8 w-[130px] rounded-md border text-xs"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
              }}
            >
              <span>{{ 'async-await': 'async/await', promises: '.then()', callback: 'callback' }[options.codeStyle]}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="async-await">async/await</SelectItem>
              <SelectItem value="promises">.then()</SelectItem>
              <SelectItem value="callback">callback</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Error handling toggle */}
        <label
          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Switch
            size="sm"
            checked={options.errorHandling === 'try-catch'}
            onCheckedChange={(checked: boolean) =>
              update({ errorHandling: (checked ? 'try-catch' : 'none') as CurlErrorHandling })
            }
          />
          try/catch
        </label>

        {/* Variables toggle */}
        <label
          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Switch
            size="sm"
            checked={options.variableStyle === 'extracted'}
            onCheckedChange={(checked: boolean) =>
              update({ variableStyle: (checked ? 'extracted' : 'hardcoded') as CurlVariableStyle })
            }
          />
          extract vars
        </label>

        {/* Separator */}
        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <ConvertButton
          onClick={onConvert}
          isConverting={isConverting}
          label="Convert"
        />

        <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

        <PoweredByIndicator />

        <KeyboardShortcutHint />
      </div>
    </div>
  );
}
