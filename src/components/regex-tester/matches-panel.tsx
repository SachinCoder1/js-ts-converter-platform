'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { RegexMatch, RegexTestResult } from '@/lib/types';

interface MatchesPanelProps {
  testResult: RegexTestResult;
}

export function MatchesPanel({ testResult }: MatchesPanelProps) {
  const { matches, matchCount, isValid, error } = testResult;

  return (
    <div
      className="flex flex-col h-full rounded-md overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between h-8 px-3 shrink-0"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--background)',
        }}
      >
        <span
          className="font-mono text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Matches
        </span>
        {isValid && matchCount > 0 && (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
              color: 'var(--primary)',
            }}
          >
            {matchCount}{matchCount >= 10000 ? '+' : ''}
          </span>
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-1.5"
        style={{ background: 'var(--surface)' }}
      >
        {error && (
          <div
            className="p-3 rounded text-xs font-mono"
            style={{ color: 'var(--error)', background: 'color-mix(in srgb, var(--error) 8%, transparent)' }}
          >
            {error}
          </div>
        )}

        {isValid && matchCount === 0 && !error && (
          <div
            className="flex items-center justify-center h-full text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            No matches found
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {matches.slice(0, 200).map((match, index) => (
            <motion.div
              key={`${match.index}-${index}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
            >
              <MatchCard match={match} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>

        {matchCount > 200 && (
          <p
            className="text-center text-[10px] py-2 font-mono"
            style={{ color: 'var(--text-disabled)' }}
          >
            Showing 200 of {matchCount} matches
          </p>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, index }: { match: RegexMatch; index: number }) {
  const hasGroups = Object.keys(match.groups).length > 0;
  const hasCaptures = match.captures.length > 0;

  return (
    <div
      className="rounded-md p-2 space-y-1.5"
      style={{
        background: 'var(--background)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Match header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[10px] font-mono font-semibold shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
        >
          #{index + 1}
        </span>
        <span
          className="text-[10px] font-mono"
          style={{ color: 'var(--text-disabled)' }}
        >
          @{match.index}
        </span>
      </div>

      {/* Full match */}
      <div
        className="font-mono text-xs px-2 py-1 rounded break-all"
        style={{
          background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
          color: 'var(--text-primary)',
        }}
      >
        {match.fullMatch}
      </div>

      {/* Named groups */}
      {hasGroups && (
        <div className="space-y-0.5">
          <span
            className="text-[10px] font-mono uppercase"
            style={{ color: 'var(--text-disabled)', letterSpacing: '0.05em' }}
          >
            Named Groups
          </span>
          <div className="grid gap-0.5">
            {Object.entries(match.groups).map(([name, value]) => (
              <div key={name} className="flex items-center gap-2 text-[11px] font-mono">
                <span style={{ color: 'var(--text-tertiary)' }}>{name}:</span>
                <span style={{ color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positional captures */}
      {hasCaptures && !hasGroups && (
        <div className="space-y-0.5">
          <span
            className="text-[10px] font-mono uppercase"
            style={{ color: 'var(--text-disabled)', letterSpacing: '0.05em' }}
          >
            Groups
          </span>
          <div className="grid gap-0.5">
            {match.captures.map((capture, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                <span style={{ color: 'var(--text-tertiary)' }}>${i + 1}:</span>
                <span style={{ color: capture !== undefined ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                  {capture ?? 'undefined'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
