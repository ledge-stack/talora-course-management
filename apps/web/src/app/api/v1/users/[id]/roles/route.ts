import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Fetch the caller
    const caller = await db.user.findUnique({
      where: { id: scope.userId },
      include: { roles: true }
    });

    if (!caller) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPlatformAdmin = caller.roles.some(r => r.role === 'PLATFORM_ADMIN');
    if (!isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden. Requires PLATFORM_ADMIN role.' }, { status: 403 });
    }

    // Target User
    const targetUserId = params.id;
    const body = await req.json();
    const { roles } = body; // Expected to be an array of RoleType strings e.g. ["STUDENT", "PLATFORM_ADMIN"]

    if (!Array.isArray(roles)) {
      return NextResponse.json({ error: 'Roles must be an array of strings' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUser.institutionId !== caller.institutionId) {
      return NextResponse.json({ error: 'Cannot modify users outside your institution' }, { status: 403 });
    }

    // Prevent removing your own PLATFORM_ADMIN role to avoid locking yourself out
    if (caller.id === targetUserId && !roles.includes('PLATFORM_ADMIN')) {
      return NextResponse.json({ error: 'You cannot remove your own PLATFORM_ADMIN role' }, { status: 400 });
    }

    // Wrap the role update in a transaction
    await db.$transaction(async (tx) => {
      // 1. Delete existing roles for this user
      await tx.userRole.deleteMany({
        where: { userId: targetUserId }
      });

      // 2. Insert the new roles
      if (roles.length > 0) {
        await tx.userRole.createMany({
          data: roles.map((role: any) => ({
            userId: targetUserId,
            role: role
          }))
        });
      }
    });

    const updatedUser = await db.user.findUnique({
      where: { id: targetUserId },
      include: { roles: true }
    });

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });

  } catch (error) {
    console.error('Update User Roles Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
