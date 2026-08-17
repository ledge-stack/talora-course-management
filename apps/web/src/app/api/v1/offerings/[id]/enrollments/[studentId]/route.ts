import { NextResponse } from 'next/server';
import { db } from '@talora/database';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, studentId: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);

    const isRepOrAdmin = scope.roles.some((r: any) => 
      r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN'
    );

    if (!isRepOrAdmin) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Only Class Reps or Admins can unenroll students' }, { status: 403 });
    }

    if (scope.userId === params.studentId) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'You cannot unenroll yourself from the roster. Please contact an admin.' }, { status: 403 });
    }

    // Wrap in a transaction to ensure clean removal
    await db.$transaction([
      db.groupMembership.deleteMany({
        where: { offeringId: params.id, studentId: params.studentId }
      }),
      db.groupChangeRequest.deleteMany({
        where: { studentId: params.studentId }
      }),
      db.enrollment.deleteMany({
        where: { offeringId: params.id, studentId: params.studentId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing student from offering:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
