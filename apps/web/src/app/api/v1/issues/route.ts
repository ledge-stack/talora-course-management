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
    const status = url.searchParams.get('status'); // optional filter
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '25', 10)));
    const skip = (page - 1) * limit;

    if (!offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'offeringId is required' }, { status: 400 });
    }

    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

    // Reps see all issues for the offering. Students see only their own issues.
    const whereClause: any = { offeringId };
    if (!isRep) {
      whereClause.studentId = scope.userId;
    }
    if (status) {
      whereClause.status = status;
    }

    const [issues, total] = await Promise.all([
      db.issue.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
        },
        skip,
        take: limit,
      }),
      db.issue.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: issues,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total },
    });
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
