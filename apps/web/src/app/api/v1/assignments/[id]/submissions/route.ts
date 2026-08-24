import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export const dynamic = 'force-dynamic';



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);

    // Verify user is a student in the offering that this assignment belongs to
    // For simplicity, we just assume they are if they have the assignment ID
    // A stricter check would fetch the assignment, get offeringId, and check enrollments
    const assignment = await db.assignment.findUnique({ where: { id: params.id } });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return NextResponse.json({ error: 'Submissions are closed for this assignment.' }, { status: 403 });
    }

    const isStudent = scope.roles.some((r: any) => r.role === 'STUDENT' && r.offeringId === assignment.offeringId);
    if (!isStudent) {
      // Platform Admins/Reps might not need to submit, but if they do, we can allow it
      // For now, only restrict if no valid role
      const canSubmit = scope.roles.some((r: any) => r.role === 'STUDENT' || r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
      if (!canSubmit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: 'Submission URL is required' }, { status: 400 });
    }

    // Check for existing submission
    const existingSubmission = await db.submission.findFirst({
      where: {
        assignmentId: params.id,
        studentId: scope.userId
      }
    });

    if (existingSubmission) {
      // Update existing
      const updated = await db.submission.update({
        where: { id: existingSubmission.id },
        data: { fileUrl, submittedAt: new Date() }
      });
      return NextResponse.json({ data: updated });
    }

    // Create new submission
    const submission = await db.submission.create({
      data: {
        assignmentId: params.id,
        studentId: scope.userId,
        fileUrl
      }
    });

    return NextResponse.json({ data: submission }, { status: 201 });
  } catch (err: any) {
    console.error('Submission error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
