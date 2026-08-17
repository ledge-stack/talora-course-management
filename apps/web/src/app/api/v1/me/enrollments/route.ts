import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export async function POST(req: NextRequest) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = JSON.parse(scopeHeader);

    const body = await req.json();
    const { offeringId } = body;

    if (!offeringId) {
      return NextResponse.json({ error: 'Course offering ID is required.' }, { status: 400 });
    }

    const offering = await db.courseOffering.findUnique({
      where: { id: offeringId }
    });

    if (!offering) {
      return NextResponse.json({ error: 'Course offering not found.' }, { status: 404 });
    }

    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        studentId_offeringId: {
          studentId: scope.userId,
          offeringId: offeringId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'You are already enrolled in this course.' }, { status: 400 });
    }

    const enrollment = await db.enrollment.create({
      data: {
        studentId: scope.userId,
        offeringId: offeringId
      }
    });

    return NextResponse.json({ success: true, data: enrollment }, { status: 201 });
  } catch (err: any) {
    console.error('Enrollment Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
