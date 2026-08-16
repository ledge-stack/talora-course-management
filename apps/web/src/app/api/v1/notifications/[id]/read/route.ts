import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;

    const notification = await db.notification.findUnique({
      where: { id: params.id }
    });

    if (!notification) return NextResponse.json({ code: 'NOT_FOUND', message: 'Notification not found' }, { status: 404 });
    if (notification.userId !== scope.userId) return NextResponse.json({ code: 'FORBIDDEN', message: 'Not your notification' }, { status: 403 });

    const updated = await db.notification.update({
      where: { id: params.id },
      data: { isRead: true }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
