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
    const canEdit = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!canEdit) return NextResponse.json({ code: 'FORBIDDEN' }, { status: 403 });

    const body = await request.json();
    const { tookGapYear } = body;

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: { tookGapYear }
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error('Error updating gap year status:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
