import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { hashPassword } from '@talora/auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';
import { verifyFirebaseToken } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';


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
    // eslint-disable-next-line prefer-const
    let { fullName, email, studentNumber, registrationNumber, phoneNumber, password } = body;

    if (!fullName || !email || !studentNumber || !registrationNumber || !phoneNumber || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }



    studentNumber = studentNumber.replace(/\s+/g, '');
    registrationNumber = registrationNumber.replace(/\s+/g, '').toUpperCase();
    email = email.trim();

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Email domain restriction removed to allow any email

    const studentNumberRegex = /^[1-2][0-9]007\d{5}$/;
    if (!studentNumberRegex.test(studentNumber)) {
      return NextResponse.json({ error: 'Invalid Student Number format. It should look like 2400712345 or 1900712345.' }, { status: 400 });
    }

    const regNumberRegex = /^[1-2][0-9]\/[UXIE]\/\d{4,5}(?:\/(?:EVE|PS|PSA))?$/;
    if (!regNumberRegex.test(registrationNumber)) {
      return NextResponse.json({ error: 'Invalid Registration Number format. It should look like 24/U/12345 or 19/U/0349.' }, { status: 400 });
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

    const { firebaseIdToken } = body;
    if (!firebaseIdToken) {
      return NextResponse.json({ error: 'Phone verification is required. Please verify your phone number first.' }, { status: 400 });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(firebaseIdToken);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired phone verification token.' }, { status: 401 });
    }

    // Optional: check if phone number matches
    // Note: Firebase numbers are in E.164 format (e.g. +256701234567)
    if (decodedToken.phone_number !== phoneNumber) {
      return NextResponse.json({ error: 'The verified phone number does not match the provided phone number.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        fullName,
        email,
        studentNumber,
        registrationNumber,
        phoneNumber,
        acceptedTerms: true,
        passwordHash: hashedPassword,
        institutionId: institution.id,
        isEmailVerified: true, // Auto-verify since they verified phone
      }
    });

    // Assign generic STUDENT role (without a specific class for now, they will enroll in offerings manually)
    await db.userRole.create({
      data: {
        userId: newUser.id,
        role: 'STUDENT'
      }
    });

    return NextResponse.json({ success: true, userId: newUser.id, requiresVerification: false }, { status: 201 });
  } catch (err: any) {
    console.error('Registration Error:', err);
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'This Student Number or Registration Number is already registered.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
