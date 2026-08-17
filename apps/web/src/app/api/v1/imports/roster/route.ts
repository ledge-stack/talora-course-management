import { NextResponse } from 'next/server';
import { Queue } from 'bullmq';


import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const importQueue = new Queue('import-jobs', { connection });

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader);
    const isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to import rosters' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const offeringId = formData.get('offeringId') as string;

    if (!file || !offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing file or offeringId' }, { status: 400 });
    }

    const csvString = await file.text();

    const job = await importQueue.add('roster-import', {
      csvString,
      offeringId
    });

    return NextResponse.json({ data: { jobId: job.id } });
  } catch (error) {
    console.error('Error in import roster:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
