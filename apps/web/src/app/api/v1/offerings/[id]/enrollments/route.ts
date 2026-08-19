import { NextResponse } from 'next/server';
import { db } from '@talora/database';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim() ?? '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = { offeringId: params.id };
    if (search) {
      whereClause.student = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { studentNumber: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [enrollments, total] = await Promise.all([
      db.enrollment.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              studentNumber: true,
              registrationNumber: true,
              memberships: {
                where: { offeringId: params.id },
                include: { group: true },
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { student: { fullName: 'asc' } },
      }),
      db.enrollment.count({ where: whereClause }),
    ]);

    // Map to a cleaner response format for the frontend
    const mapped = enrollments.map(e => ({
      id: e.student.id,
      studentId: e.student.studentNumber || e.student.id,
      name: e.student.fullName,
      email: e.student.email,
      group: e.student.memberships[0]?.group?.name || 'Unassigned',
      status: 'Registered',
    }));

    return NextResponse.json({
      data: mapped,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total },
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
