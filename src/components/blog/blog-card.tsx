'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { BlogPostMeta } from '@/lib/types';
import { CATEGORY_GRADIENTS, CATEGORY_LABELS, DIFFICULTY_COLORS, formatDate } from './constants';

interface BlogCardProps {
  post: BlogPostMeta;
  index?: number;
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.03,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block h-full rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Category gradient header */}
        <div
          className="relative h-32 flex items-end p-4"
          style={{ background: CATEGORY_GRADIENTS[post.category] }}
        >
          {/* Noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3">
          {/* Category + Difficulty badges */}
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                color: 'var(--primary)',
              }}
            >
              {CATEGORY_LABELS[post.category]}
            </span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{
                color: DIFFICULTY_COLORS[post.difficulty],
                border: `1px solid color-mix(in srgb, ${DIFFICULTY_COLORS[post.difficulty]} 25%, transparent)`,
              }}
            >
              {post.difficulty}
            </span>
          </div>

          <h3
            className="text-base font-semibold leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-[var(--primary)]"
            style={{
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {post.title}
          </h3>

          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {post.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-auto pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>
              {formatDate(post.publishDate)}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Hover glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--primary) 30%, transparent)',
          }}
        />
      </Link>
    </motion.div>
  );
}
