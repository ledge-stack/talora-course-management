import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

    if (!isRep) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Only Class Reps can view ungrouped students' }, { status: 403 });
    }

    const offeringId = params.id;

    // Fetch all students enrolled in this offering
    const enrollments = await db.enrollment.findMany({
      where: { offeringId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentNumber: true
          }
        }
      }
    });

    // Fetch all memberships in this offering
    const memberships = await db.groupMembership.findMany({
      where: { offeringId },
      select: { studentId: true }
    });
    const membershipSet = new Set(memberships.map(m => m.studentId));

    // Filter to ungrouped students
    const ungroupedStudents = enrollments
      .filter(e => !membershipSet.has(e.studentId))
      .map(e => e.student);

    if (ungroupedStudents.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Check for pending requests for these ungrouped students
    const studentIds = ungroupedStudents.map(s => s.id);
    const pendingRequests = await db.groupChangeRequest.findMany({
      where: {
        studentId: { in: studentIds },
        status: 'PENDING',
        group: { offeringId }
      },
      include: {
        group: { select: { id: true, name: true } }
      }
    });

    // We only care about requests where the student is trying to JOIN
    const requestMap = new Map();
    pendingRequests.forEach(req => {
      // If targetGroupId is null, groupId is the group they want to join.
      const targetId = req.targetGroupId || req.groupId;
      const targetName = req.targetGroupId ? null : req.group.name;
      
      requestMap.set(req.studentId, {
        id: req.id,
        targetGroupId: targetId,
        targetGroupName: targetName
      });
    });

    // Re-fetch target group names if any targetGroupIds exist (unlikely for ungrouped but safe)
    const needsTargetName = Array.from(requestMap.values()).filter(r => !r.targetGroupName && r.targetGroupId);
    if (needsTargetName.length > 0) {
      const targetGroups = await db.group.findMany({
        where: { id: { in: needsTargetName.map(r => r.targetGroupId) } },
        select: { id: true, name: true }
      });
      const targetGroupMap = new Map(targetGroups.map(g => [g.id, g.name]));
      for (const val of Array.from(requestMap.values())) {
        if (!val.targetGroupName && val.targetGroupId) {
          val.targetGroupName = targetGroupMap.get(val.targetGroupId) || 'Unknown Group';
        }
      }
    }

    const result = ungroupedStudents.map(s => ({
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      studentNumber: s.studentNumber,
      pendingRequest: requestMap.get(s.id) || null
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching ungrouped students:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
