import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    const scope = JSON.parse(scopeHeader) as UserScope;

    const url = new URL(request.url);
    const offeringId = url.searchParams.get('offeringId');

    const whereClause: any = {};
    if (offeringId) {
      whereClause.offeringId = offeringId;
    } else {
      // Fetch for all enrolled offerings
      const enrollments = await db.enrollment.findMany({ where: { studentId: scope.userId }, select: { offeringId: true } });
      const offeringIds = enrollments.map(e => e.offeringId);
      whereClause.offeringId = { in: offeringIds };
    }

    const events = await db.timetableEvent.findMany({
      where: whereClause,
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json({ data: events });
  } catch (error) {
    console.error('Error fetching timetable events:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    
    const scope = JSON.parse(scopeHeader) as UserScope;
    const canEdit = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!canEdit) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });

    const body = await request.json();
    const { offeringId, title, location, dayOfWeek, startTime, endTime } = body;

    const newEvent = await db.timetableEvent.create({
      data: {
        offeringId,
        title,
        location,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      }
    });

    return NextResponse.json({ data: newEvent }, { status: 201 });
  } catch (error) {
    console.error('Error creating timetable event:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
