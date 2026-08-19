import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    
    const scope = JSON.parse(scopeHeader) as UserScope;
    const canEdit = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!canEdit) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });

    await db.timetableEvent.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timetable event:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
