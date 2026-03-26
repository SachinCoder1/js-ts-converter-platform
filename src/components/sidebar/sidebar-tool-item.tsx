'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ToolConfig } from '@/lib/tool-config';
import { useSidebar } from './sidebar-context';

function ToolIcon({ config }: { config: ToolConfig }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  );
}

export function SidebarToolItem({ config }: { config: ToolConfig }) {
  const pathname = usePathname();
  const { isCollapsed, setMobileOpen } = useSidebar();
  const isActive = pathname === config.path;
  const isAI = config.tags.includes('AI-Powered');

  const link = (
    <Link
      href={config.path}
      onClick={() => setMobileOpen(false)}
      className="group flex items-center gap-2.5 rounded-md transition-colors duration-150"
      style={{
        padding: isCollapsed ? '8px 0' : '6px 10px',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        background: isActive ? 'var(--sidebar-accent)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        minHeight: '36px',
      }}
      aria-label={config.name}
      aria-current={isActive ? 'page' : undefined}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--hover)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      <ToolIcon config={config} />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate text-[13px] font-medium">{config.name}</span>
          {isAI && (
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
              style={{
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
              }}
            >
              AI
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          className="block w-full"
          render={<div />}
        >
          {link}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {config.name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}
