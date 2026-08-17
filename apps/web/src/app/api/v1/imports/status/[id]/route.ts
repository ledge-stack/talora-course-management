import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';

import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const importQueue = new Queue('import-jobs', { connection });

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const job = await importQueue.getJob(params.id);

    if (!job) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Job not found' }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return NextResponse.json({
      data: {
        id: job.id,
        state,
        progress,
        result,
        failedReason
      }
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
