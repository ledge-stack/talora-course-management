import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    const url = new URL(request.url);
    const offeringId = url.searchParams.get('offeringId');

    if (!offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'offeringId is required' }, { status: 400 });
    }

    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');

    // Reps see all issues for the offering. Students see only their own issues.
    const whereClause: any = { offeringId };
    if (!isRep) {
      whereClause.studentId = scope.userId;
    }

    const issues = await db.issue.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      }
    });

    return NextResponse.json({ data: issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const body = await request.json();

    const { offeringId, title, description, category } = body;
    
    if (!offeringId || !title || !description || !category) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing required fields' }, { status: 400 });
    }

    const issue = await db.issue.create({
      data: {
        offeringId,
        title,
        description,
        category,
        studentId: scope.userId,
        status: 'OPEN'
      }
    });

    return NextResponse.json({ data: issue }, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
