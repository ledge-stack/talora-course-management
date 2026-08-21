import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const isRepOrAdmin = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

    if (!isRepOrAdmin) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Invalid action' }, { status: 400 });
    }

    const resetReq = await db.passwordResetRequest.findUnique({
      where: { id: params.id }
    });

    if (!resetReq) return NextResponse.json({ code: 'NOT_FOUND', message: 'Request not found' }, { status: 404 });
    if (resetReq.status !== 'PENDING') {
      return NextResponse.json({ code: 'CONFLICT', message: 'Request already processed' }, { status: 409 });
    }

    if (action === 'REJECT') {
      await db.passwordResetRequest.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          processedAt: new Date(),
          processedById: scope.userId
        }
      });
      return NextResponse.json({ message: 'Request rejected' });
    }

    // Process Approval
    const tempPassword = `Talora${Math.floor(1000 + Math.random() * 9000)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await db.$transaction([
      db.user.update({
        where: { id: resetReq.studentId },
        data: { passwordHash }
      }),
      db.passwordResetRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          processedAt: new Date(),
          processedById: scope.userId
        }
      })
    ]);

    return NextResponse.json({ 
      message: 'Password reset successful',
      temporaryPassword: tempPassword
    });

  } catch (error) {
    console.error('Error processing password reset:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
