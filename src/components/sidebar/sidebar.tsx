'use client';

import Image from 'next/image';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { SIDEBAR_CATEGORIES } from '@/lib/tool-config';
import { useSidebar } from './sidebar-context';
import { SidebarSearch } from './sidebar-search';
import { SidebarCategory } from './sidebar-category';
import { SidebarFooter } from './sidebar-footer';
import { SidebarMobile } from './sidebar-mobile';

export function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden"
        style={{
          width: isCollapsed ? 56 : 240,
          transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'var(--sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
        aria-label="Tool navigation sidebar"
      >
        {/* Logo area */}
        <div
          className="flex items-center gap-2 px-3 shrink-0"
          style={{ height: 48, borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <Image
            src="/snipshift_logo_transparent.png"
            alt="SnipShift"
            width={24}
            height={24}
            className="rounded shrink-0"
            style={{ width: 24, height: 24 }}
          />
          {!isCollapsed && (
            <span
              className="text-sm font-semibold truncate"
              style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              SnipShift
            </span>
          )}
        </div>

        {/* Search */}
        <SidebarSearch />

        {/* Tool categories */}
        <nav className="flex-1 overflow-y-auto py-1" aria-label="Tool navigation">
          <div className="flex flex-col gap-1">
            {SIDEBAR_CATEGORIES.map((cat) => (
              <SidebarCategory key={cat.id} category={cat} />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <SidebarFooter />

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="flex items-center justify-center shrink-0 transition-colors duration-150 hover:bg-[var(--hover)]"
          style={{
            height: 36,
            color: 'var(--text-tertiary)',
            borderTop: '1px solid var(--sidebar-border)',
          }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      <SidebarMobile />
    </>
  );
}
