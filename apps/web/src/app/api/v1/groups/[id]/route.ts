import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const body = await request.json();

    const group = await db.group.findUnique({
      where: { id: params.id }
    });

    if (!group) return NextResponse.json({ code: 'NOT_FOUND', message: 'Group not found' }, { status: 404 });

    // Only reps or the group leader can update the group
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');
    const isLeader = group.leaderId === scope.userId;

    if (!isRep && !isLeader) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to modify this group' }, { status: 403 });
    }

    // Prepare update data
    const data: any = {};
    if (body.name && isLeader) data.name = body.name; // Leader can rename
    if (body.status && isRep) data.status = body.status; // Only Rep can force status
    if (body.isLocked !== undefined && isRep) data.isLocked = body.isLocked; // Only Rep can lock
    if (body.isOpen !== undefined && (isRep || isLeader)) data.isOpen = body.isOpen; // Leader/Rep can toggle Open/Closed
    if (body.leaderId && (isRep || isLeader)) {
      // Transfer leadership
      // Verify new leader is in the group
      const newLeaderMembership = await db.groupMembership.findFirst({
        where: {
          groupId: group.id,
          studentId: body.leaderId
        }
      });
      if (!newLeaderMembership) {
        return NextResponse.json({ code: 'BAD_REQUEST', message: 'New leader must be a group member' }, { status: 400 });
      }
      data.leaderId = body.leaderId;
    }

    const updated = await db.group.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
