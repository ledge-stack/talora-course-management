import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { hashPassword } from '@talora/auth';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';


export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = rateLimit(ip, 5, 60 * 1000); // 5 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Email, token, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    if (!user.resetToken || user.resetToken !== token) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Token has expired. Please request a new password reset.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully.' }, { status: 200 });
  } catch (err: any) {
    console.error('Reset Password Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
