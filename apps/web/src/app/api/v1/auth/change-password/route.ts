import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { verifyPassword, hashPassword } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function PUT(req: NextRequest) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const scope = JSON.parse(scopeHeader);
    const userId = scope.userId;

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    // Fetch the user from the database
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    // Hash the new password and update
    const newPasswordHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    console.error('Password change error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
