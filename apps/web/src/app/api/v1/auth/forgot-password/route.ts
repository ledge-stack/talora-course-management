import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    
    // For security reasons, we do not want to reveal if an email is registered or not.
    // If the user doesn't exist, we still return success to the client, but do nothing.
    if (!user) {
      return NextResponse.json({ success: true, message: 'If the email exists, a reset code was sent.' }, { status: 200 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: otp,
        resetTokenExpires: expiresAt
      }
    });

    // Send the OTP via email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset</h2>
          <p>Hi ${user.fullName},</p>
          <p>We received a request to reset your password. Use the following 6-digit code to proceed:</p>
          <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'If the email exists, a reset code was sent.' }, { status: 200 });
  } catch (err: any) {
    console.error('Forgot Password Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
