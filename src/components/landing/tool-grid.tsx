'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOOL_REGISTRY, TOOL_META, FILTER_CATEGORIES } from '@/lib/constants';
import { useInView } from '@/hooks/use-in-view';
import { ToolCard } from './tool-card';
import type { FilterCategory } from '@/lib/types';

const allTools = Object.values(TOOL_REGISTRY).map((tool) => ({
  ...tool,
  meta: TOOL_META[tool.id],
})).filter((t) => t.meta);

export function ToolGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const { ref, isInView } = useInView({ threshold: 0.05 });

  const filteredTools = useMemo(() => {
    if (activeFilter === 'all') return allTools;
    return allTools.filter((t) => t.meta.categories.includes(activeFilter));
  }, [activeFilter]);

  return (
    <section
      id="tools"
      ref={ref}
      className="relative px-6 py-24"
      style={{ background: 'var(--background)' }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h2
            className="text-2xl font-bold sm:text-3xl"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Developer Converters
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            15+ free tools to convert, generate, and transform code
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8 flex flex-wrap gap-1"
        >
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className="relative rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors duration-150"
              style={{
                color: activeFilter === cat.id ? 'var(--primary)' : 'var(--text-tertiary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {activeFilter === cat.id && (
                <motion.div
                  layoutId="filter-indicator"
                  className="absolute inset-0 rounded-md"
                  style={{
                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                  }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tool grid */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, i) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                meta={tool.meta}
                index={i}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
