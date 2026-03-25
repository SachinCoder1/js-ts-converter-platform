'use client';

import { motion } from 'framer-motion';

interface MobileTabSwitcherProps {
  activeTab: 'input' | 'output';
  onTabChange: (tab: 'input' | 'output') => void;
}

export function MobileTabSwitcher({ activeTab, onTabChange }: MobileTabSwitcherProps) {
  return (
    <div
      className="relative flex h-9 rounded-md p-0.5"
      style={{ background: 'var(--muted)' }}
      role="tablist"
      aria-label="Editor panels"
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-[5px]"
        style={{
          width: 'calc(50% - 2px)',
          background: 'var(--surface)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
        animate={{ x: activeTab === 'input' ? 2 : 'calc(100% + 2px)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      {/* Accent underline */}
      <motion.div
        className="absolute bottom-0 h-0.5 rounded-full"
        style={{
          width: 'calc(50% - 16px)',
          background: 'var(--primary)',
          opacity: 0.6,
        }}
        animate={{ x: activeTab === 'input' ? 10 : 'calc(100% + 10px)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      {(['input', 'output'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className="relative z-10 flex-1 text-xs font-medium capitalize transition-colors duration-150"
          style={{
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}
          role="tab"
          aria-selected={activeTab === tab}
          aria-controls={`${tab}-panel`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
