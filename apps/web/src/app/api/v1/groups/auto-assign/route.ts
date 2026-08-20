import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const studentId = scope.userId;
    const body = await request.json();
    const { offeringId } = body;

    if (!offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'offeringId is required' }, { status: 400 });
    }

    const offering = await db.courseOffering.findUnique({
      where: { id: offeringId }
    });

    if (!offering) return NextResponse.json({ code: 'NOT_FOUND', message: 'Offering not found' }, { status: 404 });

    // Check if already in a group
    const existingMembership = await db.groupMembership.findFirst({
      where: { studentId, offeringId }
    });

    if (existingMembership) {
      return NextResponse.json({ code: 'CONFLICT', message: 'You are already in a group' }, { status: 409 });
    }

    // Find all groups that are open, not locked, and have space
    const groups = await db.group.findMany({
      where: {
        offeringId,
        isOpen: true,
        isLocked: false
      },
      include: {
        _count: { select: { memberships: true } }
      }
    });

    const openGroupsWithSpace = groups.filter(g => g._count.memberships < offering.maxGroupSize);

    if (openGroupsWithSpace.length > 0) {
      // Pick a random open group
      const targetGroup = openGroupsWithSpace[Math.floor(Math.random() * openGroupsWithSpace.length)];
      
      const membership = await db.groupMembership.create({
        data: {
          groupId: targetGroup.id,
          studentId,
          offeringId
        }
      });
      return NextResponse.json({ data: membership, message: `Auto-assigned to group ${targetGroup.name}` });
    }

    // No open groups available, create a new one
    const student = await db.user.findUnique({ where: { id: studentId } });
    const studentName = student?.fullName || 'Student';
    
    // Auto-generate a name
    const existingGroups = await db.group.findMany({
      where: { offeringId },
      select: { name: true }
    });
    let maxNumber = 0;
    for (const g of existingGroups) {
      const match = g.name.match(/Group (\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }
    const groupName = `Group ${maxNumber + 1} (${studentName.split(' ')[0]})`;

    const newGroup = await db.group.create({
      data: {
        name: groupName,
        offeringId,
        leaderId: studentId,
        isOpen: true,
        memberships: {
          create: {
            studentId,
            offeringId
          }
        }
      }
    });

    // Also assign a GROUP_LEADER role
    await db.userRole.create({
      data: {
        userId: studentId,
        role: 'GROUP_LEADER',
        classId: offering.classId
      }
    });

    return NextResponse.json({ data: newGroup, message: 'Created a new group for you' });

  } catch (error: any) {
    console.error('Error auto-assigning group:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
}
