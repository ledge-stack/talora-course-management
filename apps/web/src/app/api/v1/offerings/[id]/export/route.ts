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

    const rosterUsers = await db.user.findMany({
      where: {
        OR: [
          { enrollments: { some: { offeringId: params.id } } },
          { memberships: { some: { offeringId: params.id } } }
        ]
      },
      include: {
        memberships: {
          where: { offeringId: params.id },
          include: { group: true }
        }
      }
    });

    const students = rosterUsers.map(user => ({
      fullName: user.fullName,
      email: user.email,
      studentNumber: user.studentNumber || '',
      registrationNumber: user.registrationNumber || '',
      group: user.memberships[0]?.group?.name || 'Unassigned'
    }));

    // Sort by group name, then by full name
    students.sort((a, b) => {
      if (a.group < b.group) return -1;
      if (a.group > b.group) return 1;
      if (a.fullName < b.fullName) return -1;
      if (a.fullName > b.fullName) return 1;
      return 0;
    });

    // Generate CSV string
    const headers = ['Group', 'Full Name', 'Email', 'Student Number', 'Registration Number'];
    const rows = students.map(s => [
      s.group,
      s.fullName,
      s.email,
      s.studentNumber,
      s.registrationNumber
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
