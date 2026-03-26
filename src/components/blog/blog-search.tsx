'use client';

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/types';
import { CATEGORY_LABELS, formatDate } from './constants';

export interface BlogSearchHandle {
  open: () => void;
}

interface BlogSearchProps {
  allPosts: BlogPostMeta[];
}

export const BlogSearch = forwardRef<BlogSearchHandle, BlogSearchProps>(
  function BlogSearch({ allPosts }, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }));

    // Cmd+K / Ctrl+K listener
    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen(prev => !prev);
        }
      }
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input on open
    useEffect(() => {
      if (isOpen) {
        setQuery('');
        setSelectedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }, [isOpen]);

    const results = query.trim()
      ? allPosts.filter(post => {
          const q = query.toLowerCase();
          return (
            post.title.toLowerCase().includes(q) ||
            post.description.toLowerCase().includes(q) ||
            post.keyword.toLowerCase().includes(q) ||
            post.tags.some(tag => tag.toLowerCase().includes(q))
          );
        }).slice(0, 8)
      : [];

    const navigate = useCallback((slug: string) => {
      setIsOpen(false);
      router.push(`/blog/${slug}`);
    }, [router]);

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        navigate(results[selectedIndex].slug);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-xl mx-4 rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: 'var(--elevated)',
                border: '1px solid var(--border)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <Search size={18} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search articles..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-disabled)]"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 transition-colors hover:bg-[var(--surface)]"
                >
                  <X size={16} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              </div>

              {/* Results */}
              {query.trim() && (
                <div className="max-h-[360px] overflow-y-auto py-2">
                  {results.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-disabled)' }}>
                      No articles found for &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    results.map((post, i) => (
                      <button
                        key={post.slug}
                        onClick={() => navigate(post.slug)}
                        className="w-full text-left px-4 py-3 transition-colors duration-75"
                        style={{
                          background: i === selectedIndex
                            ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                            : 'transparent',
                        }}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                              color: 'var(--primary)',
                            }}
                          >
                            {CATEGORY_LABELS[post.category]}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>
                            {formatDate(post.publishDate)}
                          </span>
                        </div>
                        <p
                          className="text-sm font-medium line-clamp-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {post.title}
                        </p>
                        <p
                          className="text-xs line-clamp-1 mt-0.5"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {post.description}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Footer hint */}
              {!query.trim() && (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                    Search across titles, descriptions, tags, and keywords
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
