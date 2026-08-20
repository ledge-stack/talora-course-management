import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { signJwt } from '@talora/auth';
import type { UserScope, Role } from '@talora/auth';
import { rateLimit } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

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
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { roles: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Email is already verified. Please log in.' }, { status: 400 });
    }

    if (user.verificationToken !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Mark as verified and clear token
    await db.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      }
    });

    // Generate JWT and log them in
    const payload: UserScope = {
      userId: user.id,
      roles: user.roles.map(r => ({
        role: r.role as Role,
        classId: r.classId || undefined,
      })),
    };

    const token = await signJwt(payload);

    // Send "Successfully Registered" Welcome Email asynchronously
    sendEmail({
      to: user.email,
      subject: 'Welcome to Talora!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Registration Successful 🎉</h2>
          <p>Hi ${user.fullName},</p>
          <p>Your email has been verified and your Talora account is fully active.</p>
          <p>You can now log in, enroll in course offerings, and join project groups.</p>
          <br/>
          <p>Best,<br/>The Talora Team</p>
        </div>
      `
    }).catch(err => console.error('Failed to send welcome email:', err));

    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: { id: user.id, fullName: user.fullName }
    });

    response.cookies.set({
      name: 'talora_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error('Verification Error:', err);
    return NextResponse.json({ error: 'Internal server error during verification.' }, { status: 500 });
  }
}
