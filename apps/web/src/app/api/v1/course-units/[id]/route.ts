import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);
    
    // Check if user is a rep or admin
    const isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { title, lecturerName, lecturerEmail, lecturerPhone } = body;

    const updatedUnit = await db.courseUnit.update({
      where: { id: params.id },
      data: {
        title,
        lecturerName,
        lecturerEmail,
        lecturerPhone
      }
    });

    return NextResponse.json({ data: updatedUnit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
