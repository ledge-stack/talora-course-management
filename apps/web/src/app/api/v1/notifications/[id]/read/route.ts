import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export const dynamic = 'force-dynamic';



export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);

    // Verify the notification belongs to the user
    const notification = await db.notification.findUnique({ where: { id: params.id } });
    if (!notification) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (notification.userId !== scope.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await db.notification.update({
      where: { id: params.id },
      data: { isRead: true }
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error('Error marking notification read:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
