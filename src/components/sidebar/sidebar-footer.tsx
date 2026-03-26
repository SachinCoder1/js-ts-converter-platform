'use client';

import { ThemeToggle } from '../theme-toggle';
import { useSidebar } from './sidebar-context';

export function SidebarFooter() {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className="flex items-center gap-2 px-3 py-3"
      style={{ borderTop: '1px solid var(--sidebar-border)' }}
    >
      <ThemeToggle />
      {!isCollapsed && (
        <span
          className="text-[11px] font-medium truncate"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Built by SnipShift
        </span>
      )}
    </div>
  );
}
