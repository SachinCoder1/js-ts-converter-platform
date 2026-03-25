import 'server-only';

export type SecurityEvent =
  | 'rate_limit_hit'
  | 'failure_block'
  | 'global_limit_hit'
  | 'bot_detected'
  | 'suspicious_output'
  | 'output_ratio_flag'
  | 'validation_failure'
  | 'yaml_bomb_attempt'
  | 'untrusted_client';

interface SecurityLogEntry {
  event: SecurityEvent;
  timestamp: string;
  ip: string;
  details?: Record<string, unknown>;
}

/**
 * Logs a structured security event to stdout (for Vercel log drain / production monitoring).
 * NEVER logs: user code content, API keys, full stack traces, or PII beyond IP.
 */
export function logSecurityEvent(
  event: SecurityEvent,
  ip: string,
  details?: Record<string, unknown>,
): void {
  const entry: SecurityLogEntry = {
    event,
    timestamp: new Date().toISOString(),
    ip,
    ...(details && { details }),
  };

  // Structured JSON to stdout for log drain ingestion
  console.log(JSON.stringify(entry));
}
