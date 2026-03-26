'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { BlogCategory } from '@/lib/types';

interface CategoryFilterProps {
  categories: { id: BlogCategory; label: string; count: number }[];
  totalCount: number;
}

export function CategoryFilter({ categories, totalCount }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('category') || 'all';

  function handleFilter(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    params.delete('page');
    router.push(`/blog?${params.toString()}`, { scroll: false });
  }

  const tabs = [
    { id: 'all', label: 'All', count: totalCount },
    ...categories.filter(c => c.count > 0),
  ];

  return (
    <div className="relative px-6 mb-2">
      <div className="mx-auto max-w-6xl">
        <div
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-none"
          role="tablist"
          style={{
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleFilter(tab.id)}
                className="relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors duration-150"
                style={{
                  color: isActive ? 'var(--background)' : 'var(--text-tertiary)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="blog-category-active"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'var(--text-primary)',
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
                <span
                  className="relative text-[10px] font-mono"
                  style={{ opacity: isActive ? 0.7 : 0.5 }}
                >
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)',
          }}
        />
      </div>
    </div>
  );
}
