import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { hashPassword } from '@talora/auth';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = rateLimit(ip, 3, 60 * 1000); // 3 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { fullName, email, studentNumber, registrationNumber, password } = body;

    if (!fullName || !email || !studentNumber || !registrationNumber || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Email domain restriction removed to allow any email

    const studentNumberRegex = /^2[0-9]007\d{5}$/;
    if (!studentNumberRegex.test(studentNumber)) {
      return NextResponse.json({ error: 'Invalid Student Number format. It should look like 2400712345.' }, { status: 400 });
    }

    const regNumberRegex = /^2[0-9]\/[U|X|I]\/\d{5}(?:\/(?:EVE|PS|PSA))?$/;
    if (!regNumberRegex.test(registrationNumber)) {
      return NextResponse.json({ error: 'Invalid Registration Number format. It should look like 24/U/12345 or 24/X/12345/PS.' }, { status: 400 });
    }

    const snYear = studentNumber.substring(0, 2);
    const rnYear = registrationNumber.substring(0, 2);
    if (snYear !== rnYear) {
      return NextResponse.json({ error: 'The admission year in your Student Number and Registration Number must match.' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 400 });
    }

    // Get default institution
    const institution = await db.institution.findFirst();
    if (!institution) {
      return NextResponse.json({ error: 'Platform configuration error: No institution found.' }, { status: 500 });
    }

    const hashedPassword = await hashPassword(password);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await db.user.create({
      data: {
        fullName,
        email,
        studentNumber,
        registrationNumber,
        passwordHash: hashedPassword,
        institutionId: institution.id,
        isEmailVerified: false,
        verificationToken: otp,
      }
    });

    // Assign generic STUDENT role (without a specific class for now, they will enroll in offerings manually)
    await db.userRole.create({
      data: {
        userId: newUser.id,
        role: 'STUDENT'
      }
    });

    // Send the OTP via email
    await sendEmail({
      to: newUser.email,
      subject: 'Verify your Talora account',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Talora, ${newUser.fullName}!</h2>
          <p>Please use the following 6-digit code to verify your email address and complete your registration:</p>
          <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, userId: newUser.id, requiresVerification: true }, { status: 201 });
  } catch (err: any) {
    console.error('Registration Error:', err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'This Student Number or Registration Number is already registered.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
