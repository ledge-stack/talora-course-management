import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import { cookies } from 'next/headers';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const { offeringId } = await request.json();

    if (!offeringId) {
      return NextResponse.json({ error: 'offeringId is required' }, { status: 400 });
    }

    // Verify the offering exists
    const offering = await db.courseOffering.findUnique({ where: { id: offeringId } });
    if (!offering) {
      return NextResponse.json({ error: 'Offering not found' }, { status: 404 });
    }

    const isPlatformAdmin = scope.roles.some((r: any) => r.role === 'PLATFORM_ADMIN');
    const repClassIds = scope.roles
      .filter((r: any) => r.role === 'CLASS_REPRESENTATIVE' && r.classId)
      .map((r: any) => r.classId);
    const isRep = repClassIds.length > 0;

    // Platform admins can switch to any offering
    if (!isPlatformAdmin) {
      if (isRep) {
        // Reps can only switch to offerings belonging to their assigned class
        if (!repClassIds.includes(offering.classId)) {
          return NextResponse.json(
            { error: 'You are not authorized to access this offering' },
            { status: 403 }
          );
        }
      } else {
        // Students can only activate an offering they are enrolled in
        const enrollment = await db.enrollment.findFirst({
          where: { studentId: scope.userId, offeringId },
        });
        if (!enrollment) {
          return NextResponse.json(
            { error: 'You are not enrolled in this offering' },
            { status: 403 }
          );
        }
      }
    }

    cookies().set('active_offering_id', offeringId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting active offering:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
