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
    
    let studentId = scope.userId;
    const body = await request.json().catch(() => ({}));
    
    if (body.studentId) {
      studentId = body.studentId;
    } else if (body.studentNumber) {
      const student = await db.user.findFirst({ where: { studentNumber: body.studentNumber } });
      if (!student) return NextResponse.json({ code: 'NOT_FOUND', message: 'No student found with that student number' }, { status: 404 });
      studentId = student.id;
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

    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    const isLeader = group.leaderId === scope.userId;

    if (studentId !== scope.userId) {
      // Trying to add someone else
      if (!isRep && !isLeader) {
        return NextResponse.json({ code: 'FORBIDDEN', message: 'Only the Group Leader or a Class Rep can add members directly' }, { status: 403 });
      }
    } else {
      // Trying to join themselves
      if (!group.isOpen && !isRep) {
        return NextResponse.json({ code: 'FORBIDDEN', message: 'Group is invite-only' }, { status: 403 });
      }
    }

    const membership = await db.groupMembership.create({
      data: {
        groupId: group.id,
        studentId: studentId,
        offeringId: group.offeringId
      }
    });

    const pendingReqs = await db.groupChangeRequest.findMany({
      where: {
        studentId: studentId,
        status: 'PENDING',
        group: { offeringId: group.offeringId }
      }
    });
    if (pendingReqs.length > 0) {
      await db.groupChangeRequest.updateMany({
        where: { id: { in: pendingReqs.map(r => r.id) } },
        data: { status: 'REJECTED' }
      });
    }

    // Update status if it reached min size, and also handle leadership handoff if the group was empty or leader is a rep
    let groupUpdates: any = {};
    if (group._count.memberships + 1 >= group.offering.minGroupSize && group.status === 'FORMING') {
      const { GroupStatus } = await import('@talora/database');
      groupUpdates.status = GroupStatus.COMPLETE;
    }

    // Check if the current leader is actually in the group
    if (group._count.memberships === 0) {
      // If the group had 0 members, the first person to join becomes the leader
      groupUpdates.leaderId = studentId;
    } else {
      const isLeaderInGroup = await db.groupMembership.findFirst({
        where: { groupId: group.id, studentId: group.leaderId }
      });
      if (!isLeaderInGroup) {
        groupUpdates.leaderId = studentId;
      }
    }

    if (Object.keys(groupUpdates).length > 0) {
      await db.group.update({
        where: { id: group.id },
        data: groupUpdates
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
