'use client';

import { motion } from 'framer-motion';
import type { GraphqlToTsResult } from '@/lib/types';

interface StatsProps {
  result: GraphqlToTsResult;
  fromCache: boolean;
}

function StatBadge({ label, value, variant = 'default' }: { label: string; value: string | number; variant?: 'default' | 'success' }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
      style={{
        background: 'var(--muted)',
        color: variant === 'success' ? 'var(--success)' : 'var(--text-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      {value}
    </span>
  );
}

export function GraphqlToTsConversionStats({ result, fromCache }: StatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <StatBadge label="Types" value={result.stats.typesGenerated} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <StatBadge label="Enums" value={result.stats.enumsConverted} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <StatBadge label="Fields" value={result.stats.fieldsTyped} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <StatBadge label="Inputs" value={result.stats.inputTypesGenerated} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <StatBadge
          label=""
          value={`${result.duration < 1000 ? result.duration + 'ms' : (result.duration / 1000).toFixed(1) + 's'} · ${result.provider}${fromCache ? ' · cached' : ''}`}
        />
      </motion.div>
    </div>
  );
}
