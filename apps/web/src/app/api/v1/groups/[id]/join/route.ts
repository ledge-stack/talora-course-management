import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const studentId = scope.userId;
    const targetGroupId = params.id;

    // 1. Get the group
    const group = await db.group.findUnique({
      where: { id: targetGroupId },
      include: {
        _count: { select: { memberships: true } },
        offering: true
      }
    });

    if (!group) return NextResponse.json({ code: 'NOT_FOUND', message: 'Group not found' }, { status: 404 });

    // 2. Check if student is already in a group for this offering
    const existingMembership = await db.groupMembership.findFirst({
      where: {
        studentId,
        offeringId: group.offeringId
      }
    });

    if (existingMembership) {
      return NextResponse.json({ code: 'CONFLICT', message: 'You are already in a group for this course' }, { status: 409 });
    }

    // 3. Check group capacity
    if (group._count.memberships >= group.offering.maxGroupSize) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Group is full' }, { status: 400 });
    }

    if (group.isLocked) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Group is locked' }, { status: 403 });
    }

    // 4. If OPEN, join immediately
    if (group.isOpen) {
      const membership = await db.groupMembership.create({
        data: {
          groupId: group.id,
          studentId,
          offeringId: group.offeringId
        }
      });
      return NextResponse.json({ data: membership, message: 'Successfully joined group' });
    } else {
      // 5. If CLOSED (Invite Only), create a join request
      // Prevent duplicate pending requests to the same group
      const existingRequest = await db.groupChangeRequest.findFirst({
        where: {
          studentId,
          groupId: group.id,
          status: 'PENDING'
        }
      });

      if (existingRequest) {
        return NextResponse.json({ code: 'CONFLICT', message: 'You already have a pending request for this group' }, { status: 409 });
      }

      const request = await db.groupChangeRequest.create({
        data: {
          groupId: group.id,
          studentId,
          reason: 'Student requested to join'
        }
      });

      return NextResponse.json({ data: request, message: 'Request sent to group leader' });
    }
  } catch (error: any) {
    console.error('Error joining group:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
}
