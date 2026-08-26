import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'No user scope found' }, { status: 401 });
    }

    const scope = JSON.parse(scopeHeader) as UserScope;
    const user = await db.user.findUnique({
      where: { id: scope.userId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentNumber: user.studentNumber,
        registrationNumber: user.registrationNumber,
        phoneNumber: user.phoneNumber,
        roles: scope.roles,
      },
    });
  } catch (error) {
    console.error('Error in /api/v1/me:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
