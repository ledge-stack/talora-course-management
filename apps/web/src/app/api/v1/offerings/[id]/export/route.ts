import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export const dynamic = 'force-dynamic';



export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return new NextResponse('Unauthorized', { status: 401 });
    const scope = JSON.parse(scopeHeader);
    
    const isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) return new NextResponse('Forbidden', { status: 403 });

    const enrollments = await db.enrollment.findMany({
      where: { offeringId: params.id },
      include: {
        student: true
      },
      orderBy: { student: { fullName: 'asc' } }
    });

    // Generate CSV string
    const headers = ['Full Name', 'Email', 'Student Number', 'Registration Number'];
    const rows = enrollments.map(e => [
      e.student.fullName,
      e.student.email,
      e.student.studentNumber || '',
      e.student.registrationNumber || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="class_roster_${params.id}.csv"`
      }
    });
  } catch (err: any) {
    console.error('Export Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
