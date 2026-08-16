import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { hashPassword } from '@talora/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, studentNumber, registrationNumber, password } = body;

    if (!fullName || !email || !studentNumber || !registrationNumber || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!email.endsWith('@students.mak.ac.ug')) {
      return NextResponse.json({ error: 'Only Makerere University student emails (@students.mak.ac.ug) are allowed.' }, { status: 400 });
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

    const newUser = await db.user.create({
      data: {
        fullName,
        email,
        studentNumber,
        registrationNumber,
        passwordHash: hashedPassword,
        institutionId: institution.id,
      }
    });

    // Assign generic STUDENT role (without a specific class for now, they will enroll in offerings manually)
    await db.userRole.create({
      data: {
        userId: newUser.id,
        role: 'STUDENT'
      }
    });

    return NextResponse.json({ success: true, userId: newUser.id }, { status: 201 });
  } catch (err: any) {
    console.error('Registration Error:', err);
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
