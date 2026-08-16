import { logInfo, logError } from '@talora/observability';
import { db } from '@talora/database';
import { Worker } from 'bullmq';
import { parse } from 'csv-parse';

import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

logInfo('Talora Background Worker starting...', { module: 'Worker', action: 'INIT' });

const worker = new Worker('import-jobs', async (job) => {
  logInfo(`Processing import job ${job.id}`, { module: 'Worker', action: 'PROCESS_IMPORT', jobId: job.id });
  
  const { csvString, offeringId } = job.data;
  
  if (!csvString || !offeringId) {
    throw new Error('Missing csvString or offeringId in job data');
  }

  // Parse CSV
  const rows: any[] = await new Promise((resolve, reject) => {
    parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });

  const offering = await db.courseOffering.findUnique({
    where: { id: offeringId },
    include: { term: true }
  });
  if (!offering) throw new Error('Offering not found');

  // Example expected headers: FullName, Email, StudentNumber
  let importedCount = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const email = row.Email;
    
    // Formula injection protection
    const safeStudentNum = row.StudentNumber?.startsWith('=') || row.StudentNumber?.startsWith('+') || row.StudentNumber?.startsWith('-') || row.StudentNumber?.startsWith('@') ? `'${row.StudentNumber}` : row.StudentNumber;
    const fullName = row.FullName || 'Unknown Student';
    const studentNumber = safeStudentNum || `SN-${Math.floor(Math.random() * 1000000)}`;

    if (!email) continue;

    // Report progress
    await job.updateProgress(Math.floor((i / rows.length) * 100));

    // Create or find user
    let user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Import the hash helper inline to avoid top-level issues if needed, or import at top. Let's just require it.
      const { hashPassword } = require('@talora/auth');
      const passwordHash = await hashPassword('temporary-password-123');

      user = await db.user.create({
        data: {
          email,
          fullName,
          studentNumber,
          passwordHash,
          institutionId: offering.term.institutionId
        }
      });
      
      // Also give them student role
      await db.userRole.create({
        data: {
          userId: user.id,
          role: 'STUDENT',
          classId: offering.classId
        }
      });
    }

    // Create enrollment if not exists
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        studentId_offeringId: {
          studentId: user.id,
          offeringId: offeringId
        }
      }
    });

    if (!existingEnrollment) {
      await db.enrollment.create({
        data: {
          studentId: user.id,
          offeringId: offeringId
        }
      });
      
      // Send notification
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'You have been enrolled!',
          message: `You were enrolled in a new class via bulk import. Welcome!`
        }
      });

      importedCount++;
    }
  }

  await job.updateProgress(100);
  logInfo(`Import job ${job.id} completed. Enrolled ${importedCount} students.`, { module: 'Worker', action: 'COMPLETE_IMPORT', jobId: job.id });
  return { success: true, importedCount, totalRows: rows.length };
}, { connection });

worker.on('failed', (job, err) => {
  logError(`Job ${job?.id} failed`, err, { module: 'Worker', action: 'JOB_FAILED' });
});

logInfo('Worker ready and listening on import-jobs queue.', { module: 'Worker', action: 'READY' });
