import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;

    const url = new URL(request.url);
    const available = url.searchParams.get('available') === 'true';

    let offerings = [];
    if (available) {
      // Find all offerings the user is NOT enrolled in
      const enrolledIds = (await db.enrollment.findMany({
        where: { studentId: scope.userId },
        select: { offeringId: true }
      })).map(e => e.offeringId);

      offerings = await db.courseOffering.findMany({
        where: {
          id: { notIn: enrolledIds }
        },
        include: { unit: true, class: true, term: true }
      });
    } else {
      const user = await db.user.findUnique({ where: { id: scope.userId } });
      
      if (user) {
        const enrollments = await db.enrollment.findMany({
          where: { studentId: user.id },
          include: { offering: { include: { unit: true, class: true, term: true } } }
        });
        offerings = enrollments.map(e => e.offering);
      }
    }

    return NextResponse.json({ data: offerings });
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
