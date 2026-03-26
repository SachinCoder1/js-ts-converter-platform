'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PackageToBadgesOptions, BadgeCategories } from '@/lib/package-to-badges';

interface PackageToBadgesControlBarProps {
  options: PackageToBadgesOptions;
  onOptionsChange: (options: PackageToBadgesOptions) => void;
}

const CATEGORY_LABELS: Record<keyof BadgeCategories, string> = {
  packageInfo: 'Package Info',
  engine: 'Node Engine',
  typescript: 'TypeScript',
  frameworks: 'Frameworks',
  testing: 'Testing',
  linting: 'Linting',
  buildTools: 'Build Tools',
  ci: 'CI',
  bundleSize: 'Bundle Size',
  downloads: 'Downloads',
};

export function PackageToBadgesControlBar({ options, onOptionsChange }: PackageToBadgesControlBarProps) {
  const update = <K extends keyof PackageToBadgesOptions>(key: K, value: PackageToBadgesOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const toggleCategory = (key: keyof BadgeCategories) => {
    update('categories', { ...options.categories, [key]: !options.categories[key] });
  };

  const enabledCount = Object.values(options.categories).filter(Boolean).length;
  const totalCount = Object.keys(options.categories).length;

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Badge style */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Style
        </span>
        <Select
          value={options.style}
          onValueChange={(v) => update('style', v as PackageToBadgesOptions['style'])}
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
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="flat-square">Flat Square</SelectItem>
            <SelectItem value="for-the-badge">Badge</SelectItem>
            <SelectItem value="plastic">Plastic</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Output format */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Format
        </span>
        <Select
          value={options.format}
          onValueChange={(v) => update('format', v as PackageToBadgesOptions['format'])}
        >
          <SelectTrigger
            className="h-8 w-[130px] rounded-md border text-xs"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="rst">RST</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Custom color */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Color
        </span>
        <input
          type="text"
          value={options.colorScheme}
          onChange={(e) => update('colorScheme', e.target.value)}
          placeholder="Default"
          className="h-8 w-[90px] rounded-md border px-2 text-xs"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
          }}
        />
      </div>

      <div className="hidden sm:block h-5 w-px" style={{ background: 'var(--border)' }} />

      {/* Badge categories */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Include
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 rounded-md border px-3 text-xs font-medium cursor-pointer"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
            }}
          >
            Badges ({enabledCount}/{totalCount})
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {(Object.entries(CATEGORY_LABELS) as [keyof BadgeCategories, string][]).map(
              ([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={options.categories[key]}
                  onCheckedChange={() => toggleCategory(key)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
