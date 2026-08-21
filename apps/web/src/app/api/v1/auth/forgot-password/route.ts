import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import { rateLimit } from '@/lib/rateLimit';

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

    // Check if there is already a pending request
    const existingReq = await db.passwordResetRequest.findFirst({
      where: {
        studentId: user.id,
        status: 'PENDING'
      }
    });

    if (existingReq) {
      return NextResponse.json({ message: 'If an account matches, a reset request has been sent to your Class Representative.' });
    }

    // Create a new request
    await db.passwordResetRequest.create({
      data: {
        studentId: user.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ message: 'If an account matches, a reset request has been sent to your Class Representative.' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'An error occurred while submitting the request' }, { status: 500 });
  }
}
