'use client';

import { motion } from 'framer-motion';

interface OptionSwitchProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  ariaLabel?: string;
}

export function OptionSwitch<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: OptionSwitchProps<T>) {
  const activeIndex = options.findIndex((o) => o.value === value);

  return (
    <div
      className="relative flex h-8 rounded-md p-0.5"
      style={{ background: 'var(--muted)' }}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-[5px]"
        style={{
          width: `calc(${100 / options.length}% - 2px)`,
          background: 'var(--surface)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
        animate={{
          x: `calc(${activeIndex * 100}% + ${activeIndex * 2}px)`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className="relative z-10 flex h-full flex-1 items-center justify-center font-mono text-xs font-medium transition-colors duration-150 px-3"
          style={{
            color: value === option.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
            minWidth: 'max-content',
          }}
          role="radio"
          aria-checked={value === option.value}
          aria-label={option.label}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
