'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { BlogPostMeta } from '@/lib/types';
import { CATEGORY_GRADIENTS_BRIGHT, CATEGORY_LABELS, DIFFICULTY_COLORS, formatDate } from './constants';

interface FeaturedPostProps {
  post: BlogPostMeta;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <section className="px-6 pb-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="group relative block overflow-hidden rounded-2xl transition-all duration-200"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Gradient area */}
              <div
                className="relative h-3 md:h-auto md:w-2/5 lg:w-1/3 min-h-[200px] hidden md:block"
                style={{ background: CATEGORY_GRADIENTS_BRIGHT[post.category] }}
              >
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              {/* Mobile: thin color bar */}
              <div
                className="h-2 md:hidden"
                style={{ background: CATEGORY_GRADIENTS_BRIGHT[post.category] }}
              />

              {/* Content */}
              <div className="flex flex-1 flex-col justify-center p-6 md:p-8 lg:p-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                      color: 'var(--primary)',
                    }}
                  >
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      color: DIFFICULTY_COLORS[post.difficulty],
                      border: `1px solid color-mix(in srgb, ${DIFFICULTY_COLORS[post.difficulty]} 30%, transparent)`,
                    }}
                  >
                    {post.difficulty}
                  </span>
                </div>

                <h2
                  className="text-xl sm:text-2xl font-bold tracking-tight mb-3 line-clamp-2 group-hover:text-[var(--primary)] transition-colors duration-150"
                  style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
                >
                  {post.title}
                </h2>

                <p
                  className="text-sm leading-relaxed line-clamp-2 mb-5"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {post.description}
                </p>

                <div className="flex items-center gap-4">
                  <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                    {formatDate(post.publishDate)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                    {post.readTime}
                  </span>
                  <span
                    className="ml-auto text-xs font-medium group-hover:gap-2 inline-flex items-center gap-1.5 transition-all duration-200"
                    style={{ color: 'var(--primary)' }}
                  >
                    Read Article
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Hover glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--primary) 30%, transparent)',
              }}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
