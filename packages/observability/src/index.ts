/**
 * Structured Logging, Metrics, and Audit Outbox utilities for Talora
 */

export interface LogContext {
  requestId?: string;
  userId?: string;
  module: string;
  action: string;
  [key: string]: unknown;
}

export function logInfo(message: string, context: LogContext): void {
  console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...context }));
}

export function logError(message: string, error: unknown, context: LogContext): void {
  console.error(
    JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? error.message : String(error),
      ...context,
    })
  );
}

export function recordAuditTrail(action: string, actorId: string, details: Record<string, unknown>): void {
  logInfo(`Audit Event: ${action}`, {
    module: 'Audit',
    action,
    userId: actorId,
    details,
  });
}
