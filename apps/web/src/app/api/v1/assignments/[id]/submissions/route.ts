import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export const dynamic = 'force-dynamic';



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);

    const assignment = await db.assignment.findUnique({ where: { id: params.id } });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return NextResponse.json({ error: 'Submissions are closed for this assignment.' }, { status: 403 });
    }

    const isStudent = scope.roles.some((r: any) => r.role === 'STUDENT' && r.offeringId === assignment.offeringId);
    if (!isStudent) {
      const canSubmit = scope.roles.some((r: any) => r.role === 'STUDENT' || r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
      if (!canSubmit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Submissions are made on behalf of the student's group for this offering,
    // not the individual student — assignments are submitted once per group.
    const membership = await db.groupMembership.findUnique({
      where: { studentId_offeringId: { studentId: scope.userId, offeringId: assignment.offeringId } },
    });

    if (!membership) {
      return NextResponse.json({ error: 'You must be in a group for this course to submit an assignment.' }, { status: 403 });
    }

    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: 'Submission URL is required' }, { status: 400 });
    }

    // Atomic upsert on the (assignmentId, groupId) unique constraint — avoids the
    // find-then-write race condition of the previous check-then-create/update pattern,
    // and records the student who actually submitted for accountability.
    const submission = await db.submission.upsert({
      where: { assignmentId_groupId: { assignmentId: params.id, groupId: membership.groupId } },
      update: { fileUrl, studentId: scope.userId, submittedAt: new Date() },
      create: {
        assignmentId: params.id,
        groupId: membership.groupId,
        studentId: scope.userId,
        fileUrl,
      },
    });

    return NextResponse.json({ data: submission }, { status: 201 });
  } catch (err: any) {
    console.error('Submission error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
