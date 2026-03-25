'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBanner } from '../error-banner';
import { MobileTabSwitcher } from '../mobile-tab-switcher';
import { StatusBar } from '../status-bar';
import { EditorPair } from './editor-pair';
import { CacheBadge } from './cache-badge';
import { LiveIndicator } from './live-indicator';
import { useAnnouncer } from '../shared/screen-reader-announcer';

interface ConverterLayoutProps {
  // Editor content
  inputValue: string;
  onInputChange: (value: string) => void;
  outputValue: string;

  // Editor config
  inputLanguage: string;
  outputLanguage: string;
  inputFileType: string;
  outputFileType: string;
  downloadFileName?: string;
  emptyStateMessage?: string;
  emptyStateHint?: string;

  // Conversion state
  isConverting?: boolean;
  error?: string | null;
  isAstFallback?: boolean;
  astFallbackMessage?: string;

  // Cache
  fromCache?: boolean;
  resultKey?: string;

  // Status bar
  statusText?: string;
  statusState?: 'idle' | 'active' | 'done';
  modelIndicator?: string;

  // Control bar — render prop for tool-specific controls
  renderControlBar: () => React.ReactNode;

  // Stats section below editors
  renderStats?: () => React.ReactNode;

  // Live mode for instant tools
  isLiveMode?: boolean;

  // Scanning effect on input
  inputIsScanning?: boolean;

  // Rate limit info
  rateLimitRemaining?: number | null;
  rateLimitTotal?: number | null;
}

export function ConverterLayout({
  inputValue,
  onInputChange,
  outputValue,
  inputLanguage,
  outputLanguage,
  inputFileType,
  outputFileType,
  downloadFileName = 'converted.ts',
  emptyStateMessage,
  emptyStateHint,
  isConverting = false,
  error,
  isAstFallback = false,
  astFallbackMessage,
  fromCache = false,
  resultKey,
  statusText = 'Ready',
  statusState = 'idle',
  modelIndicator,
  renderControlBar,
  renderStats,
  isLiveMode = false,
  inputIsScanning = false,
  rateLimitRemaining,
  rateLimitTotal,
}: ConverterLayoutProps) {
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  const [showCacheBadge, setShowCacheBadge] = useState(false);
  const [showReassurance, setShowReassurance] = useState(false);
  const prevResultKeyRef = useRef<string | null>(null);
  const reassuranceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { announce } = useAnnouncer();

  // Show cache badge briefly on cache hits
  useEffect(() => {
    if (fromCache && resultKey && resultKey !== prevResultKeyRef.current) {
      setShowCacheBadge(true);
      const timer = setTimeout(() => setShowCacheBadge(false), 2500);
      prevResultKeyRef.current = resultKey;
      return () => clearTimeout(timer);
    }
    if (resultKey) {
      prevResultKeyRef.current = resultKey;
    }
  }, [fromCache, resultKey]);

  // Show reassurance after 5 seconds of converting
  useEffect(() => {
    if (isConverting) {
      reassuranceTimerRef.current = setTimeout(() => setShowReassurance(true), 5000);
    } else {
      setShowReassurance(false);
    }
    return () => {
      if (reassuranceTimerRef.current) clearTimeout(reassuranceTimerRef.current);
    };
  }, [isConverting]);

  // Screen reader announcement
  const announceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (statusState === 'done' && announceRef.current) {
      announceRef.current.textContent = statusText;
      announce(statusText);
    }
  }, [statusState, statusText, announce]);

  return (
    <div className="flex flex-1 flex-col px-4 sm:px-6 py-3 max-w-screen-2xl mx-auto w-full">
      {/* Skip link target */}
      <div id="main-content" tabIndex={-1} className="sr-only" />

      {/* Screen reader announcer */}
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Control bar */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 py-2">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {renderControlBar()}
          </div>
          {isLiveMode && outputValue && <LiveIndicator />}
        </div>
      </motion.div>

      {/* Error/warning banners */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <ErrorBanner message={error} variant="error" />
          </motion.div>
        )}
        {isAstFallback && !error && astFallbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <ErrorBanner message={astFallbackMessage} variant="warning" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile tab switcher */}
      <div className="md:hidden py-2">
        <MobileTabSwitcher activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>

      {/* Cache badge */}
      <AnimatePresence>
        {showCacheBadge && <CacheBadge />}
      </AnimatePresence>

      {/* Editor pair */}
      <EditorPair
        inputValue={inputValue}
        onInputChange={onInputChange}
        outputValue={outputValue}
        inputLanguage={inputLanguage}
        outputLanguage={outputLanguage}
        inputFileType={inputFileType}
        outputFileType={outputFileType}
        downloadFileName={downloadFileName}
        emptyStateMessage={emptyStateMessage}
        emptyStateHint={emptyStateHint}
        mobileTab={mobileTab}
        isScanning={inputIsScanning}
        isConverting={isConverting}
        showCacheIndicator={fromCache}
        isLiveMode={isLiveMode}
        resultKey={resultKey}
      />

      {/* Reassurance message for long conversions */}
      <AnimatePresence>
        {showReassurance && isConverting && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="text-center text-xs py-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            AI is working on complex code — this may take a moment
          </motion.p>
        )}
      </AnimatePresence>

      {/* Conversion stats */}
      <AnimatePresence>
        {renderStats && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderStats()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <StatusBar
        text={statusText}
        state={statusState}
        modelIndicator={modelIndicator}
        fromCache={fromCache && !!resultKey}
        rateLimitRemaining={rateLimitRemaining}
        rateLimitTotal={rateLimitTotal}
      />
    </div>
  );
}
