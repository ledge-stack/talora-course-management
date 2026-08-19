import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Determine studentId to add (could be self-join or rep adding someone)
    let studentId = scope.userId;
    const body = await request.json().catch(() => ({}));
    if (body.studentId) {
      studentId = body.studentId;
    }

    const group = await db.group.findUnique({
      where: { id: params.id },
      include: {
        offering: true,
        _count: { select: { memberships: true } }
      }
    });

    if (!group) return NextResponse.json({ code: 'NOT_FOUND', message: 'Group not found' }, { status: 404 });
    
    if (group.isLocked) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Group is locked' }, { status: 403 });
    }

    if (group._count.memberships >= group.offering.maxGroupSize) {
      return NextResponse.json({ code: 'CONFLICT', message: 'Group is full' }, { status: 409 });
    }

    const membership = await db.groupMembership.create({
      data: {
        groupId: group.id,
        studentId: studentId,
        offeringId: group.offeringId
      }
    });

    // Update status if it reached min size
    if (group._count.memberships + 1 >= group.offering.minGroupSize && group.status === 'FORMING') {
      const { GroupStatus } = await import('@talora/database');
      await db.group.update({
        where: { id: group.id },
        data: { status: GroupStatus.COMPLETE }
      });
    }

    return NextResponse.json({ data: membership }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ code: 'CONFLICT', message: 'Already a member of a group in this offering' }, { status: 409 });
    }
    console.error('Error joining group:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
