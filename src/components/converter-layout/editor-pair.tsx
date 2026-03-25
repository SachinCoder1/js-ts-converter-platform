'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorPanel } from '../editor-panel';
import { ResizeHandle } from './resize-handle';

function ConvertingOverlay({ fileType }: { fileType: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
      style={{ background: 'color-mix(in srgb, var(--surface) 85%, transparent)', backdropFilter: 'blur(2px)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--primary)' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          Generating {fileType}...
        </p>
      </div>
      <div className="w-48 space-y-2 px-4">
        {[80, 60, 70, 45].map((w, i) => (
          <div
            key={i}
            className="skeleton-line"
            style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

const panelVariants = {
  hidden: (direction: 'left' | 'right') => ({
    opacity: 0,
    x: direction === 'left' ? -12 : 12,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

interface EditorPairProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  outputValue: string;
  inputLanguage: string;
  outputLanguage: string;
  inputFileType: string;
  outputFileType: string;
  downloadFileName: string;
  emptyStateMessage?: string;
  emptyStateHint?: string;
  mobileTab: 'input' | 'output';
  isScanning?: boolean;
  isConverting?: boolean;
  showCacheIndicator?: boolean;
  isLiveMode?: boolean;
  resultKey?: string;
}

export function EditorPair({
  inputValue,
  onInputChange,
  outputValue,
  inputLanguage,
  outputLanguage,
  inputFileType,
  outputFileType,
  downloadFileName,
  emptyStateMessage,
  emptyStateHint,
  mobileTab,
  isScanning,
  isConverting,
  showCacheIndicator,
  isLiveMode = false,
  resultKey,
}: EditorPairProps) {
  const [splitRatio, setSplitRatio] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showReveal, setShowReveal] = useState(false);
  const prevResultKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (resultKey && resultKey !== prevResultKeyRef.current) {
      setShowReveal(true);
      const timer = setTimeout(() => setShowReveal(false), isLiveMode ? 200 : 400);
      prevResultKeyRef.current = resultKey;
      return () => clearTimeout(timer);
    }
  }, [resultKey, isLiveMode]);

  const handleResize = useCallback((ratio: number) => {
    setSplitRatio(ratio);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 gap-0 min-h-0 mt-2"
      style={{ minHeight: '400px' }}
      id="editor-pair"
    >
      {/* Input panel */}
      <motion.div
        custom="left"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.05 }}
        className={`${mobileTab === 'output' ? 'hidden md:flex' : 'flex'}`}
        style={{ flex: `${splitRatio} 1 0%` }}
      >
        <div
          className="flex-1 flex flex-col transition-opacity duration-150"
          style={{ opacity: isConverting ? 0.6 : 1 }}
        >
          <EditorPanel
            title="Input"
            value={inputValue}
            onChange={onInputChange}
            language={inputLanguage}
            fileType={inputFileType}
            isScanning={isScanning}
          />
        </div>
      </motion.div>

      {/* Draggable resize handle */}
      <ResizeHandle onResize={handleResize} containerRef={containerRef} />

      {/* Output panel */}
      <motion.div
        custom="right"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className={`${mobileTab === 'input' ? 'hidden md:flex' : 'flex'}`}
        style={{ flex: `${1 - splitRatio} 1 0%` }}
      >
        <div className={`relative flex-1 flex flex-col ${showReveal ? (isLiveMode ? 'typewriter-reveal-fast' : 'typewriter-reveal') : ''}`}>
          <AnimatePresence>
            {isConverting && !isLiveMode && (
              <ConvertingOverlay fileType={outputFileType} />
            )}
          </AnimatePresence>
          <EditorPanel
            title="Output"
            value={outputValue}
            language={outputLanguage}
            readOnly
            fileType={outputFileType}
            showCopyButton
            showDownloadButton
            downloadFileName={downloadFileName}
            emptyStateMessage={emptyStateMessage}
            emptyStateHint={emptyStateHint}
            showCacheIndicator={showCacheIndicator}
          />
        </div>
      </motion.div>
    </div>
  );
}
