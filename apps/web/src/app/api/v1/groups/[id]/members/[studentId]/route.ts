import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function DELETE(
  request: Request,
  { params }: { params: { id: string, studentId: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;

    const group = await db.group.findUnique({
      where: { id: params.id },
      include: {
        offering: true,
        _count: { select: { memberships: true } }
      }
    });

    if (!group) return NextResponse.json({ code: 'NOT_FOUND', message: 'Group not found' }, { status: 404 });
    if (group.isLocked) return NextResponse.json({ code: 'FORBIDDEN', message: 'Group is locked' }, { status: 403 });

    // Only class reps or group leader (removing someone else or themselves), or student (removing themselves) can do this.
    // For MVP, we'll allow it if they are the student themselves or a Class Rep.
    const isSelf = params.studentId === scope.userId;
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');
    const isLeader = group.leaderId === scope.userId;

    if (!isSelf && !isRep && !isLeader) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to remove this member' }, { status: 403 });
    }

    // Leader cannot leave without transferring leadership, unless they are the last member
    if (isSelf && isLeader && group._count.memberships > 1) {
      return NextResponse.json({ code: 'CONFLICT', message: 'Group leader must transfer leadership before leaving' }, { status: 409 });
    }

    await db.groupMembership.deleteMany({
      where: {
        groupId: params.id,
        studentId: params.studentId
      }
    });

    // Update status if it dropped below min size
    if (group._count.memberships - 1 < group.offering.minGroupSize && group.status === 'COMPLETE') {
      const { GroupStatus } = await import('@talora/database');
      await db.group.update({
        where: { id: group.id },
        data: { status: GroupStatus.FORMING }
      });
    }

    // If last member leaves, delete the group?
    if (group._count.memberships - 1 === 0) {
      await db.group.delete({ where: { id: group.id } });
    }

    return NextResponse.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
