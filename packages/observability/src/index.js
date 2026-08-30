"use strict";
/**
 * Structured Logging, Metrics, and Audit Outbox utilities for Talora
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logError = logError;
exports.recordAuditTrail = recordAuditTrail;
function logInfo(message, context) {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message, ...context }));
}
function logError(message, error, context) {
    console.error(JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error: error instanceof Error ? error.message : String(error),
        ...context,
    }));
}
function recordAuditTrail(action, actorId, details) {
    logInfo(`Audit Event: ${action}`, {
        module: 'Audit',
        action,
        userId: actorId,
        details,
    });
}
