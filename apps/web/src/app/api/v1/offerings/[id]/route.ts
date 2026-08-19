import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export const dynamic = 'force-dynamic';



export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);
    
    // Check if user is a rep or admin
    const isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { minGroupSize, maxGroupSize } = body;

    if (typeof minGroupSize !== 'number' || typeof maxGroupSize !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (minGroupSize > maxGroupSize) {
      return NextResponse.json({ error: 'Min group size cannot be greater than max group size' }, { status: 400 });
    }

    const updatedOffering = await db.courseOffering.update({
      where: { id: params.id },
      data: {
        minGroupSize,
        maxGroupSize
      }
    });

    return NextResponse.json({ data: updatedOffering });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
