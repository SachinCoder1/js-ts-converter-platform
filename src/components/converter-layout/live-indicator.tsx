'use client';

export function LiveIndicator() {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium"
      style={{ color: 'var(--success)' }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: 'var(--success)',
          boxShadow: '0 0 4px var(--success)',
          animation: 'pulse 2s infinite',
        }}
      />
      Live
    </span>
  );
}
