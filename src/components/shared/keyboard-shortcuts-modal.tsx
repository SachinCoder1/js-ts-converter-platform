'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMac } from '@/hooks/use-is-mac';

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = useIsMac();
  const mod = isMac ? '\u2318' : 'Ctrl';

  const SHORTCUTS = useMemo(() => [
    { keys: `${mod}+Enter`, description: 'Convert code' },
    { keys: `${mod}+K`, description: 'Search tools' },
    { keys: `${mod}+B`, description: 'Toggle sidebar' },
    { keys: '?', description: 'Show keyboard shortcuts' },
    { keys: 'Escape', description: 'Close modal / sidebar' },
  ], [mod]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Open on ? key (when not in editor/input)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '?' && !isInputElement(e.target)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => closeRef.current?.focus());
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) setIsOpen(false);
    },
    []
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-xl overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h2
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Keyboard Shortcuts
              </h2>
              <button
                ref={closeRef}
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Close keyboard shortcuts"
              >
                <X size={16} />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="px-5 py-3">
              {SHORTCUTS.map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.split('+').map((key) => (
                      <kbd
                        key={key}
                        className="rounded px-2 py-1 text-xs font-mono font-medium"
                        style={{
                          background: 'var(--muted)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div
              className="px-5 py-3 text-center"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                Press <kbd className="font-mono">?</kbd> to toggle this dialog
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable ||
    target.closest('.monaco-editor') !== null
  );
}
