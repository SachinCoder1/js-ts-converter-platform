'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { TOOL_CONFIGS, SIDEBAR_CATEGORIES } from '@/lib/tool-config';
import { useSidebar } from './sidebar-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function MobileToolCard({ toolId }: { toolId: string }) {
  const config = TOOL_CONFIGS[toolId];
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();
  if (!config) return null;
  const isActive = pathname === config.path;
  const isAI = config.tags.includes('AI-Powered');

  return (
    <Link
      href={config.path}
      onClick={() => setMobileOpen(false)}
      className="flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-colors duration-150"
      style={{
        background: isActive ? 'var(--sidebar-accent)' : 'var(--elevated)',
        border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
        minHeight: '80px',
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="16" height="16" rx="3" fill={config.icon.color} opacity="0.15" />
        <text
          x="9"
          y="12.5"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="700"
          fontFamily="var(--font-geist-mono)"
          fill={config.icon.color}
        >
          {config.icon.label}
        </text>
      </svg>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          {config.shortName}
        </span>
        {isAI && (
          <span
            className="rounded px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
            style={{
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
            }}
          >
            AI
          </span>
        )}
      </div>
    </Link>
  );
}

export function SidebarMobile() {
  const { isMobileOpen, setMobileOpen, searchQuery, setSearchQuery } = useSidebar();
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isMobileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, setMobileOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const allTools = Object.values(TOOL_CONFIGS);
  const filteredTools = searchQuery
    ? allTools.filter((t) => {
        const q = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      })
    : null;

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={backdropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl"
            style={{
              background: 'var(--surface)',
              maxHeight: '85vh',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.2)',
            }}
            role="dialog"
            aria-label="Tool navigation"
            aria-modal="true"
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div
                className="h-1 w-10 rounded-full"
                style={{ background: 'var(--text-disabled)' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Tools
              </h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="Close tool navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-disabled)' }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="h-9 w-full rounded-lg pl-8 pr-3 text-sm"
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                  }}
                  aria-label="Search tools"
                />
              </div>
            </div>

            {/* Tool Grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {filteredTools ? (
                <div className="grid grid-cols-3 gap-2">
                  {filteredTools.map((tool) => (
                    <MobileToolCard key={tool.id} toolId={tool.id} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {SIDEBAR_CATEGORIES.map((cat) => (
                    <div key={cat.id}>
                      <h3
                        className="mb-2 text-[11px] font-semibold uppercase tracking-wider px-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {cat.label}
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {cat.toolIds.map((id) => (
                          <MobileToolCard key={id} toolId={id} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
