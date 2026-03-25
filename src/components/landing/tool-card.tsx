'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { ToolMeta } from '@/lib/types';

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    shortName: string;
    path: string;
    description: string;
  };
  meta: ToolMeta;
  index: number;
}

const tagColors: Record<string, { bg: string; text: string }> = {
  'AI-Powered': { bg: 'color-mix(in srgb, var(--primary) 12%, transparent)', text: 'var(--primary)' },
  'Instant': { bg: 'color-mix(in srgb, var(--success) 12%, transparent)', text: 'var(--success)' },
  'Popular': { bg: 'color-mix(in srgb, var(--chart-4) 12%, transparent)', text: 'var(--chart-4)' },
};

export function ToolCard({ tool, meta, index }: ToolCardProps) {
  const isFeatured = meta.featured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={isFeatured ? 'sm:col-span-2' : ''}
    >
      <Link
        href={tool.path}
        className="group block h-full rounded-xl p-5 transition-all duration-200"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${isFeatured ? 'color-mix(in srgb, var(--primary) 25%, var(--border))' : 'var(--border)'}`,
          boxShadow: isFeatured ? '0 0 30px var(--glow)' : 'none',
        }}
      >
        <div className="flex flex-col gap-3">
          {/* Source → Target labels */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-mono font-semibold"
              style={{
                background: 'var(--muted)',
                color: 'var(--text-secondary)',
              }}
            >
              {meta.sourceLabel}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ color: 'var(--primary)', opacity: 0.6 }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <span
              className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-mono font-semibold"
              style={{
                background: 'color-mix(in srgb, var(--primary) 10%, var(--muted))',
                color: 'var(--primary)',
              }}
            >
              {meta.targetLabel}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-sm font-semibold transition-colors duration-150 group-hover:text-[var(--primary)]"
            style={{
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {tool.name}
          </h3>

          {/* Description */}
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {tool.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => {
              const colors = tagColors[tag] || { bg: 'var(--muted)', text: 'var(--text-secondary)' };
              return (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] font-medium px-2 py-0.5"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    border: 'none',
                  }}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Hover glow overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--primary) 30%, transparent)`,
          }}
        />
      </Link>
    </motion.div>
  );
}
