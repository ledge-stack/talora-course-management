import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = rateLimit(ip, 3, 60 * 60 * 1000); // Max 3 resend requests per hour
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a while before requesting a new code.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Email is already verified. Please log in.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken: otp,
        verificationTokenExpires: expiresAt,
      }
    });

    // Send the OTP via email
    await sendEmail({
      to: user.email,
      subject: 'Verify your Talora account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Talora Verification Code</h2>
          <p>Hi ${user.fullName},</p>
          <p>Here is your new 6-digit code to verify your email address:</p>
          <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'A new verification code has been sent.' }, { status: 200 });
  } catch (err: any) {
    console.error('Resend Verification Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
