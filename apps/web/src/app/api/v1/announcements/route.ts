import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const url = new URL(request.url);
    const offeringId = url.searchParams.get('offeringId');
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    if (!offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'offeringId is required' }, { status: 400 });
    }

    const [announcements, total] = await Promise.all([
      db.announcement.findMany({
        where: { offeringId },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, fullName: true } }
        },
        skip,
        take: limit,
      }),
      db.announcement.count({ where: { offeringId } }),
    ]);

    return NextResponse.json({
      data: announcements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Only reps or admins can create announcements
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to create announcements' }, { status: 403 });
    }

    const { title, content, offeringId } = await request.json();

    if (!title || !content || !offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'title, content, and offeringId are required' }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        offeringId,
        authorId: scope.userId
      },
      include: {
        author: { select: { id: true, fullName: true } }
      }
    });

    // TODO: Generate notifications for enrolled students

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
