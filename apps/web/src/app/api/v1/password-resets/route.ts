import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const isRepOrAdmin = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

    if (!isRepOrAdmin) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized' }, { status: 403 });
    }

    const requests = await db.passwordResetRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentNumber: true,
            registrationNumber: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error('Error fetching password resets:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
