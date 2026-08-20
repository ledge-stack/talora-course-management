import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Determine context based on URL search params (e.g. ?offeringId=123)
    const url = new URL(request.url);
    const offeringId = url.searchParams.get('offeringId');

    if (!offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'offeringId is required' }, { status: 400 });
    }

    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');

    // A Rep sees all requests for the offering. A Student sees only their own requests.
    const whereClause: any = {
      group: { offeringId }
    };

    if (!isRep) {
      whereClause.studentId = scope.userId;
    }

    const requests = await db.groupChangeRequest.findMany({
      where: whereClause,
      include: {
        group: { select: { id: true, name: true, leaderId: true } },
      }
    });

    // Fetch target group names and student names manually to compose a nice response
    const targetGroupIds = requests.map(r => r.targetGroupId).filter(Boolean) as string[];
    const targetGroups = await db.group.findMany({ where: { id: { in: targetGroupIds } }, select: { id: true, name: true } });
    const targetGroupMap = new Map(targetGroups.map(g => [g.id, g.name]));

    const studentIds = requests.map(r => r.studentId);
    const students = await db.user.findMany({ where: { id: { in: studentIds } }, select: { id: true, fullName: true, studentNumber: true } });
    const studentMap = new Map(students.map(s => [s.id, s]));

    const mapped = requests.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: studentMap.get(r.studentId)?.fullName || 'Unknown',
      studentNumber: studentMap.get(r.studentId)?.studentNumber,
      fromGroupId: r.group.id,
      fromGroupName: r.group.name,
      targetGroupId: r.targetGroupId,
      targetGroupName: r.targetGroupId ? targetGroupMap.get(r.targetGroupId) : null,
      reason: r.reason,
      status: r.status,
      createdAt: r.createdAt
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('Error fetching group change requests:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const body = await request.json();

    const { groupId, targetGroupId, reason } = body;
    if (!groupId || !reason) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'groupId and reason are required' }, { status: 400 });
    }

    // Determine if it's a join or a transfer
    // If targetGroupId is provided, it's a transfer. The student MUST be in `groupId`.
    // If targetGroupId is not provided, it's a join request to `groupId`. The student MUST NOT be in `groupId` already.
    const group = await db.group.findUnique({ where: { id: groupId } });
    if (!group) return NextResponse.json({ code: 'NOT_FOUND', message: 'Group not found' }, { status: 404 });
    
    const existingMembership = await db.groupMembership.findFirst({
      where: {
        studentId: scope.userId,
        offeringId: group.offeringId
      }
    });

    if (targetGroupId) {
      if (!existingMembership || existingMembership.groupId !== groupId) {
        return NextResponse.json({ code: 'FORBIDDEN', message: 'You must be in the origin group to request a transfer' }, { status: 403 });
      }
    } else {
      if (existingMembership) {
        return NextResponse.json({ code: 'FORBIDDEN', message: 'You are already in a group. Use transfer instead.' }, { status: 403 });
      }
    }

    // Prevent duplicate pending requests
    const existingRequest = await db.groupChangeRequest.findFirst({
      where: {
        studentId: scope.userId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json({ code: 'CONFLICT', message: 'You already have a pending change request' }, { status: 409 });
    }

    const newRequest = await db.groupChangeRequest.create({
      data: {
        groupId,
        targetGroupId,
        studentId: scope.userId,
        reason,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ data: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating group change request:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
