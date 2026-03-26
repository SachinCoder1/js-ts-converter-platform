'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CurlTargetLanguage } from '@/lib/types';

interface LanguageTabsProps {
  value: CurlTargetLanguage;
  onChange: (lang: CurlTargetLanguage) => void;
}

const TABS: { id: CurlTargetLanguage; label: string }[] = [
  { id: 'js-fetch', label: 'JS Fetch' },
  { id: 'js-axios', label: 'Axios' },
  { id: 'ts-fetch', label: 'TS Fetch' },
  { id: 'python-requests', label: 'Python' },
  { id: 'go-net-http', label: 'Go' },
  { id: 'rust-reqwest', label: 'Rust' },
  { id: 'php-curl', label: 'PHP' },
  { id: 'ruby-net-http', label: 'Ruby' },
];

export function LanguageTabs({ value, onChange }: LanguageTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (!containerRef.current) return;
    const active = containerRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5"
      role="tablist"
      aria-label="Target language"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            data-active={isActive}
            onClick={() => onChange(tab.id)}
            className="relative whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-150 cursor-pointer"
            style={{
              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
              background: isActive ? 'var(--muted)' : 'transparent',
            }}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="curl-lang-tab-indicator"
                className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full"
                style={{ background: 'var(--primary)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
