import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // We don't check for specific roles here, because any user should be able to edit their own profile
    // But we should verify the user is editing their own ID
    const scope = JSON.parse(scopeHeader);
    if (scope.userId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, email, studentNumber, registrationNumber } = body;

    const currentUser = await db.user.findUnique({ where: { id: params.id } });
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let isEmailVerified = currentUser.isEmailVerified;
    let verificationToken = currentUser.verificationToken;
    let emailChanged = false;

    if (email && email !== currentUser.email) {
      isEmailVerified = false;
      verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      emailChanged = true;
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: { 
        fullName, 
        email, 
        studentNumber, 
        registrationNumber,
        isEmailVerified,
        verificationToken
      }
    });

    if (emailChanged) {
      // Send the OTP via email
      await sendEmail({
        to: user.email,
        subject: 'Verify your new email address',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Update</h2>
            <p>Hi ${user.fullName},</p>
            <p>You recently updated your email address on Talora. Please use the following 6-digit code to verify this new email address:</p>
            <h1 style="color: #4F46E5; letter-spacing: 2px;">${verificationToken}</h1>
            <p>If you didn't request this change, please contact support immediately.</p>
          </div>
        `
      });

      // Clear auth cookie to force them to verify
      cookies().delete('auth_token');
    }

    return NextResponse.json({ data: user, emailChanged });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email, student number, or registration number already in use' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
