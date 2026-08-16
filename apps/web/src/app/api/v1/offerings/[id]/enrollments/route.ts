import { NextResponse } from 'next/server';
import { db } from '@talora/database';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const enrollments = await db.enrollment.findMany({
      where: { offeringId: params.id },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentNumber: true,
            registrationNumber: true,
            // Include their group memberships for this offering to know their group status
            memberships: {
              where: { offeringId: params.id },
              include: { group: true },
            }
          }
        }
      },
    });

    // Map to a cleaner response format for the frontend
    const mapped = enrollments.map(e => ({
      id: e.student.id,
      studentId: e.student.studentNumber || e.student.id,
      name: e.student.fullName,
      email: e.student.email,
      group: e.student.memberships[0]?.group?.name || 'Unassigned',
      status: 'Registered', // We don't have a status on enrollment yet in Prisma
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
