'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ToolCategory } from '@/lib/types';

interface SidebarState {
  isCollapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openCategories: Set<ToolCategory>;
  toggleCategory: (cat: ToolCategory) => void;
  isMobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarState | null>(null);

const STORAGE_KEY = 'devshift-sidebar-collapsed';
const ALL_CATEGORIES: ToolCategory[] = ['typescript', 'json', 'css', 'react'];

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<ToolCategory>>(
    () => new Set(ALL_CATEGORIES)
  );
  const [isMobileOpen, setMobileOpen] = useState(false);

  // Hydrate collapse state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setIsCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setIsCollapsed(v);
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(!isCollapsed);
  }, [isCollapsed, setCollapsed]);

  const toggleCategory = useCallback((cat: ToolCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setCollapsed,
        toggleCollapsed,
        searchQuery,
        setSearchQuery,
        openCategories,
        toggleCategory,
        isMobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
