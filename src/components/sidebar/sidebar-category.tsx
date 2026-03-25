'use client';

import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOOL_CONFIGS, type SidebarCategoryConfig } from '@/lib/tool-config';
import type { ToolCategory } from '@/lib/types';
import { useSidebar } from './sidebar-context';
import { SidebarToolItem } from './sidebar-tool-item';

export function SidebarCategory({ category }: { category: SidebarCategoryConfig }) {
  const { openCategories, toggleCategory, isCollapsed, searchQuery } = useSidebar();
  const isOpen = openCategories.has(category.id as ToolCategory);

  const tools = category.toolIds
    .map((id) => TOOL_CONFIGS[id])
    .filter(Boolean)
    .filter((tool) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.shortName.toLowerCase().includes(q)
      );
    });

  // Don't render category if no tools match search
  if (tools.length === 0) return null;

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-1 py-1">
        {tools.map((tool) => (
          <SidebarToolItem key={tool.id} config={tool} />
        ))}
      </div>
    );
  }

  return (
    <div className="px-2">
      <button
        onClick={() => toggleCategory(category.id as ToolCategory)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-150"
        style={{ color: 'var(--text-tertiary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        aria-expanded={isOpen}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight size={12} />
        </motion.div>
        {category.label}
        <span
          className="ml-auto text-[10px] font-normal"
          style={{ color: 'var(--text-disabled)' }}
        >
          {tools.length}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 py-1 pl-1">
              {tools.map((tool) => (
                <SidebarToolItem key={tool.id} config={tool} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
