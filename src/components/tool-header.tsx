'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useSidebar } from './sidebar/sidebar-context';
import { TOOL_REGISTRY } from '@/lib/constants';

function useCurrentToolName() {
  const pathname = usePathname();
  const tool = Object.values(TOOL_REGISTRY).find((t) => t.path === pathname);
  return tool?.name ?? null;
}

export function ToolHeader() {
  const { setMobileOpen } = useSidebar();
  const toolName = useCurrentToolName();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40"
      style={{
        background: 'color-mix(in srgb, var(--background) 80%, transparent)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      }}
    >
      <div className="flex h-12 items-center justify-between px-4 sm:px-6">
        {/* Left: mobile hamburger + logo + breadcrumb */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger  opens sidebar drawer */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150 hover:bg-[var(--hover)]"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Open tool navigation"
          >
            <Menu size={18} />
          </button>

          {/* Logo  visible on mobile and when sidebar is collapsed */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/snipshift_logo_transparent.png"
              alt="SnipShift"
              width={24}
              height={24}
              className="rounded"
              style={{ width: 24, height: 24 }}
            />
            <span
              className="text-sm font-semibold lg:hidden"
              style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              SnipShift
            </span>
          </Link>

          {/* Desktop breadcrumb  shows current tool name */}
          {toolName && (
            <div className="hidden lg:flex items-center gap-1.5 ml-1">
              <span style={{ color: 'var(--border)' }}>/</span>
              <span
                className="text-sm font-medium truncate max-w-[200px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {toolName}
              </span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border) 20%, color-mix(in srgb, var(--primary) 15%, var(--border)) 50%, var(--border) 80%, transparent)',
        }}
      />
    </motion.header>
  );
}
