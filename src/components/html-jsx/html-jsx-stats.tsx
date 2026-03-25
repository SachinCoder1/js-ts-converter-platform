'use client';

import { motion } from 'framer-motion';
import type { HtmlToJsxStats } from '@/lib/html-to-jsx/types';

interface HtmlJsxStatsProps {
  stats: HtmlToJsxStats;
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

export function HtmlJsxStats({ stats }: HtmlJsxStatsProps) {
  const total = stats.attributesConverted + stats.stylesConverted +
    stats.commentsConverted + stats.selfClosingTagsFixed + stats.svgAttributesConverted;

  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {stats.attributesConverted > 0 && (
        <StatBadge delay={0}>
          {stats.attributesConverted} attr{stats.attributesConverted !== 1 ? 's' : ''} renamed
        </StatBadge>
      )}
      {stats.stylesConverted > 0 && (
        <StatBadge delay={0.05} variant="accent">
          {stats.stylesConverted} style{stats.stylesConverted !== 1 ? 's' : ''} parsed
        </StatBadge>
      )}
      {stats.commentsConverted > 0 && (
        <StatBadge delay={0.1}>
          {stats.commentsConverted} comment{stats.commentsConverted !== 1 ? 's' : ''}
        </StatBadge>
      )}
      {stats.selfClosingTagsFixed > 0 && (
        <StatBadge delay={0.15}>
          {stats.selfClosingTagsFixed} self-closed
        </StatBadge>
      )}
      {stats.svgAttributesConverted > 0 && (
        <StatBadge delay={0.2} variant="success">
          {stats.svgAttributesConverted} SVG attr{stats.svgAttributesConverted !== 1 ? 's' : ''}
        </StatBadge>
      )}
    </div>
  );
}
