import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = rateLimit(ip, 3, 60 * 1000); // 3 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Student Number or Email is required' }, { status: 400 });
    }

    // Find the user by email or student number or registration number
    const user = await db.user.findFirst({
      where: {
        OR: [
          { studentNumber: identifier },
          { email: identifier },
          { registrationNumber: identifier }
        ]
      }
    });

    if (!user) {
      // Return success anyway to prevent user enumeration
      return NextResponse.json({ message: 'If an account matches, a reset request has been sent to your Class Representative.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

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
          <p>We received a request to reset your password. Here is your 6-digit code:</p>
          <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An error occurred while submitting the request' }, { status: 500 });
  }
}
