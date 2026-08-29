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
export declare function logInfo(message: string, context: LogContext): void;
export declare function logError(message: string, error: unknown, context: LogContext): void;
export declare function recordAuditTrail(action: string, actorId: string, details: Record<string, unknown>): void;
