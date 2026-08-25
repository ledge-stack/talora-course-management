import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export const dynamic = 'force-dynamic';


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);
    const isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { title, content } = body;

    const announcement = await db.announcement.update({
      where: { id: params.id },
      data: { title, content }
    });

    return NextResponse.json({ data: announcement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);
    const isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.$transaction([
      db.notification.deleteMany({
        where: {
          referenceId: params.id,
          referenceType: 'ANNOUNCEMENT'
        }
      }),
      db.announcement.delete({
        where: { id: params.id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
