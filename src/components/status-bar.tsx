'use client';

interface StatusBarProps {
  text: string;
  state: 'idle' | 'active' | 'done';
  modelIndicator?: string;
  fromCache?: boolean;
  rateLimitRemaining?: number | null;
  rateLimitTotal?: number | null;
}

export function StatusBar({ text, state, modelIndicator, fromCache, rateLimitRemaining, rateLimitTotal }: StatusBarProps) {
  return (
    <div
      className="flex h-6 items-center justify-between gap-2 px-3 mt-1 rounded-b-md"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--background)',
      }}
      role="status"
      aria-label={`Conversion status: ${text}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={
            state === 'active'
              ? 'status-dot status-dot-active'
              : 'status-dot status-dot-idle'
          }
          style={
            state === 'done'
              ? { background: 'var(--success)', boxShadow: '0 0 4px var(--success)' }
              : fromCache
                ? { background: 'var(--primary)', boxShadow: '0 0 4px var(--primary)' }
                : undefined
          }
        />
        <span
          className="font-mono text-[10px]"
          style={{
            color: 'var(--text-tertiary)',
            letterSpacing: '0.03em',
          }}
        >
          {fromCache && state === 'done' ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block mr-1 -mt-0.5"
                style={{ color: 'var(--primary)' }}
              >
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              {text}
            </>
          ) : (
            text
          )}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {rateLimitRemaining !== null && rateLimitRemaining !== undefined && rateLimitTotal !== null && rateLimitTotal !== undefined && (
          <span
            className="font-mono text-[10px]"
            style={{
              color: rateLimitRemaining <= 2 ? 'var(--warning)' : 'var(--text-disabled)',
              letterSpacing: '0.03em',
            }}
          >
            {rateLimitRemaining}/{rateLimitTotal}
          </span>
        )}
        {modelIndicator && (
          <span
            className="font-mono text-[10px]"
            style={{ color: 'var(--text-disabled)', letterSpacing: '0.03em' }}
          >
            {modelIndicator}
          </span>
        )}
      </div>
    </div>
  );
}
