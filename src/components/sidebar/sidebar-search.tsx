'use client';

import { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSidebar } from './sidebar-context';

export function SidebarSearch() {
  const { searchQuery, setSearchQuery, isCollapsed } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isCollapsed) {
    return (
      <button
        onClick={() => inputRef.current?.focus()}
        className="flex h-10 w-10 items-center justify-center rounded-md mx-auto transition-colors duration-150"
        style={{ color: 'var(--text-tertiary)' }}
        aria-label="Search tools"
      >
        <Search size={16} />
      </button>
    );
  }

  return (
    <div className="relative px-3 py-2">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-disabled)' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools..."
          className="h-8 w-full rounded-md pl-8 pr-12 text-xs font-medium transition-colors duration-150"
          style={{
            background: 'var(--muted)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            outline: 'none',
          }}
          aria-label="Search tools"
          role="search"
        />
        <kbd
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-[10px] font-mono pointer-events-none"
          style={{ background: 'var(--elevated)', color: 'var(--text-disabled)' }}
        >
          {typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent) ? '\u2318K' : 'Ctrl+K'}
        </kbd>
      </div>
    </div>
  );
}
