'use client';

import { motion } from 'framer-motion';

interface ConvertButtonProps {
  onClick: () => void;
  isConverting: boolean;
  providerStatus?: string;
  label?: string;
}

export function ConvertButton({
  onClick,
  isConverting,
  providerStatus,
  label = 'Convert',
}: ConvertButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isConverting}
      whileHover={isConverting ? {} : { scale: 1.02 }}
      whileTap={isConverting ? {} : { scale: 0.98 }}
      className="relative flex h-9 items-center gap-2 overflow-hidden rounded-md px-5 text-sm font-semibold transition-shadow duration-200"
      style={{
        background: isConverting
          ? 'color-mix(in srgb, var(--primary) 60%, var(--surface))'
          : 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 100%, white 8%) 0%, var(--primary) 100%)',
        color: 'var(--primary-foreground)',
        boxShadow: isConverting
          ? 'none'
          : '0 0 0 1px color-mix(in srgb, var(--primary) 50%, transparent), 0 1px 2px rgba(0,0,0,0.2), 0 0 20px var(--glow)',
        cursor: isConverting ? 'wait' : 'pointer',
        willChange: 'transform',
        letterSpacing: '-0.01em',
      }}
    >
      {isConverting && (
        <div
          className="shimmer absolute inset-0 z-0"
          style={{ pointerEvents: 'none' }}
        />
      )}

      <span className="relative z-10 flex items-center gap-2">
        {isConverting ? (
          <span className="text-xs font-medium" style={{ opacity: 0.9 }}>
            {providerStatus || 'Converting...'}
          </span>
        ) : (
          <>
            {label}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </motion.svg>
          </>
        )}
      </span>
    </motion.button>
  );
}
