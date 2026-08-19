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
    const unreadOnly = url.searchParams.get('unread') === 'true';
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = { userId: scope.userId };
    if (unreadOnly) whereClause.isRead = false;

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
