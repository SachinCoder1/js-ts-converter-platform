'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface BlogHeroProps {
  postCount: number;
  onSearchClick?: () => void;
}

export function BlogHero({ postCount, onSearchClick }: BlogHeroProps) {
  return (
    <section className="relative px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-6xl"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight"
              style={{
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              Blog
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 text-base sm:text-lg leading-relaxed max-w-lg"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Developer guides, tutorials, and deep dives from the SnipShift team.
            </motion.p>
          </div>

          {onSearchClick && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={onSearchClick}
              className="hidden sm:flex items-center gap-2.5 rounded-full px-4 py-2 text-sm transition-all duration-150 hover:border-[var(--text-tertiary)] shrink-0 mt-2"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-disabled)',
              }}
            >
              <Search size={15} />
              <span>Search articles...</span>
              <kbd
                className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-mono"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-disabled)',
                }}
              >
                ⌘K
              </kbd>
            </motion.button>
          )}

          {/* Mobile search icon */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="sm:hidden rounded-lg p-2 mt-1 transition-colors"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-tertiary)',
              }}
            >
              <Search size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </section>
  );
}
