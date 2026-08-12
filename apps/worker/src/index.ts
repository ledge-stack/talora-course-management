import { logInfo } from '@talora/observability';
import { validateIdentifierConsistency } from '@talora/domain';

logInfo('Talora Background Worker starting...', { module: 'Worker', action: 'INIT' });

/**
 * Process Excel/CSV Import Job with row-level validation & formula injection escaping
 */
export function processImportJob(jobId: string, rows: Array<{ studentNumber: string; regNumber: string }>) {
  logInfo(`Processing import job ${jobId}`, { module: 'Worker', action: 'PROCESS_IMPORT', jobId });

  const results = rows.map((row, index) => {
    // Formula injection protection
    const safeStudentNum = row.studentNumber.startsWith('=') ? `'${row.studentNumber}` : row.studentNumber;
    const safeRegNum = row.regNumber.startsWith('=') ? `'${row.regNumber}` : row.regNumber;

    const validation = validateIdentifierConsistency(safeStudentNum, safeRegNum);
    return {
      rowIndex: index + 1,
      valid: validation.valid,
      error: validation.error,
    };
  });

  return { jobId, totalRows: rows.length, results };
}

logInfo('Worker ready for async queue events.', { module: 'Worker', action: 'READY' });
