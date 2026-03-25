'use client';

import { motion } from 'framer-motion';
import type { ConversionResult } from '@/lib/types';
import { formatDuration } from '@/lib/utils';

interface ConversionStatsProps {
  result: ConversionResult;
  fromCache: boolean;
}

function StatBadge({
  children,
  variant = 'default',
  delay = 0,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'accent';
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
    danger: {
      bg: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
      text: 'var(--destructive)',
      border: 'color-mix(in srgb, var(--destructive) 20%, transparent)',
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

export function ConversionStats({ result, fromCache }: ConversionStatsProps) {
  const providerLabel = result.provider === 'ast-only'
    ? 'AST'
    : result.provider.charAt(0).toUpperCase() + result.provider.slice(1);

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <StatBadge delay={0}>
        {result.stats.interfacesCreated} interface{result.stats.interfacesCreated !== 1 ? 's' : ''}
      </StatBadge>
      <StatBadge delay={0.05}>
        {result.stats.typesAdded} type{result.stats.typesAdded !== 1 ? 's' : ''}
      </StatBadge>
      <StatBadge
        variant={result.stats.anyCount === 0 ? 'success' : 'danger'}
        delay={0.1}
      >
        {result.stats.anyCount} any
      </StatBadge>
      <StatBadge variant="accent" delay={0.15}>
        {formatDuration(result.duration)} via {providerLabel}
      </StatBadge>
      {fromCache && (
        <StatBadge variant="success" delay={0.2}>
          cached
        </StatBadge>
      )}
    </div>
  );
}
