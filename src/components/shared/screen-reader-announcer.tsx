'use client';

import { createContext, useContext, useCallback, useRef, type ReactNode } from 'react';

interface AnnouncerContextType {
  announce: (message: string) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const regionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    if (regionRef.current) {
      // Clear then set to trigger screen reader re-announcement
      regionRef.current.textContent = '';
      requestAnimationFrame(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      });
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div
        ref={regionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer() {
  const ctx = useContext(AnnouncerContext);
  if (!ctx) {
    // Return a no-op if used outside provider (graceful degradation)
    return { announce: () => {} };
  }
  return ctx;
}
