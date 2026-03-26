'use client';

import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { List, ChevronDown, X } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  const idCounts: Record<string, number> = {};

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`\[\]]/g, '');
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      // Deduplicate IDs to match rehype-slug behavior
      const count = idCounts[id] || 0;
      idCounts[id] = count + 1;
      if (count > 0) id = `${id}-${count}`;
      headings.push({ id, text, level });
    }
  }
  return headings;
}

function TOCList({
  headings,
  activeId,
  onItemClick,
}: {
  headings: Heading[];
  activeId: string;
  onItemClick?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
              onItemClick?.();
            }}
            className="block py-1.5 text-xs transition-all duration-150 hover:text-[var(--primary)]"
            style={{
              paddingLeft: heading.level === 3 ? '16px' : '0',
              color: activeId === heading.id ? 'var(--primary)' : 'var(--text-disabled)',
              fontWeight: activeId === heading.id ? 500 : 400,
            }}
          >
            <span className="flex items-center gap-2">
              {activeId === heading.id && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--primary)' }}
                />
              )}
              <span className="line-clamp-1">{heading.text}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletOpen, setTabletOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const headings = extractHeadings(content);

  // Delayed visibility for fade-in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Scroll tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <aside
        className="hidden xl:block w-56 shrink-0 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <nav
          className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
          aria-label="Table of contents"
        >
          <h4
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            On this page
          </h4>
          <TOCList headings={headings} activeId={activeId} />
        </nav>
      </aside>

      {/* Tablet: collapsible panel (shown between md and xl) */}
      <div className="hidden md:block xl:hidden mb-8">
        <button
          onClick={() => setTabletOpen(prev => !prev)}
          className="flex items-center gap-2 text-xs font-medium py-2 transition-colors hover:text-[var(--primary)]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <ChevronDown
            size={14}
            className="transition-transform duration-200"
            style={{ transform: tabletOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          Table of Contents
        </button>
        <AnimatePresence>
          {tabletOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="pl-4 py-3 mt-1 rounded-lg"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <TOCList headings={headings} activeId={activeId} onItemClick={() => setTabletOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: floating button + bottom sheet */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Table of Contents"
        >
          <List size={18} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-50"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              {/* Sheet */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[60vh] overflow-y-auto p-6"
                style={{
                  background: 'var(--elevated)',
                  borderTop: '1px solid var(--border)',
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Table of Contents
                  </h4>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-1.5 transition-colors hover:bg-[var(--surface)]"
                  >
                    <X size={16} style={{ color: 'var(--text-tertiary)' }} />
                  </button>
                </div>
                <TOCList
                  headings={headings}
                  activeId={activeId}
                  onItemClick={() => setMobileOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
