'use client';

import { useState } from 'react';

interface ErrorBannerProps {
  message: string;
  variant?: 'warning' | 'error';
}

export function ErrorBanner({ message, variant = 'warning' }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isWarning = variant === 'warning';

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-xs font-medium my-1"
      style={{
        background: isWarning
          ? 'color-mix(in srgb, var(--warning) 8%, transparent)'
          : 'color-mix(in srgb, var(--destructive) 8%, transparent)',
        border: `1px solid ${isWarning
          ? 'color-mix(in srgb, var(--warning) 20%, transparent)'
          : 'color-mix(in srgb, var(--destructive) 20%, transparent)'
        }`,
        color: isWarning ? 'var(--warning)' : 'var(--destructive)',
      }}
    >
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          {isWarning ? (
            <>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" /><path d="M12 17h.01" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" /><path d="m9 9 6 6" />
            </>
          )}
        </svg>
        <span>{message}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 transition-opacity duration-150 opacity-60 hover:opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
