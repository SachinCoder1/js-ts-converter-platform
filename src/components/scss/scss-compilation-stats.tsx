'use client';

import { motion } from 'framer-motion';
import type { ScssConversionResult } from '@/lib/types';

interface ScssCompilationStatsProps {
  result: ScssConversionResult;
}

function StatBadge({
  children,
  variant = 'default',
  delay = 0,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'accent';
  delay?: number;
}) {
  const colors = {
    default: {
      bg: 'var(--muted)',
      text: 'var(--text-secondary)',
      border: 'var(--border)',
    },
    success: {
      bg: 'color-mix(in srgb, var(--success) 10%, transparent)',
      text: 'var(--success)',
      border: 'color-mix(in srgb, var(--success) 20%, transparent)',
    },
    accent: {
      bg: 'color-mix(in srgb, var(--primary) 8%, transparent)',
      text: 'var(--primary)',
      border: 'color-mix(in srgb, var(--primary) 15%, transparent)',
    },
  };

  const c = colors[variant];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.25,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-medium"
      style={{
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </motion.span>
  );
}

export function ScssCompilationStats({ result }: ScssCompilationStatsProps) {
  const outputSize = new TextEncoder().encode(result.css).length;
  const sizeLabel =
    outputSize < 1024
      ? `${outputSize} B`
      : `${(outputSize / 1024).toFixed(1)} KB`;

  const timeLabel =
    result.stats.compilationTime < 1000
      ? `${result.stats.compilationTime}ms`
      : `${(result.stats.compilationTime / 1000).toFixed(1)}s`;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <StatBadge variant="accent" delay={0}>
        {timeLabel}
      </StatBadge>
      <StatBadge delay={0.05}>
        {sizeLabel} output
      </StatBadge>
      <StatBadge variant="success" delay={0.1}>
        Dart Sass
      </StatBadge>
    </div>
  );
}
