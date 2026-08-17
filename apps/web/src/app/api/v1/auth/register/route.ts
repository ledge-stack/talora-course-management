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
