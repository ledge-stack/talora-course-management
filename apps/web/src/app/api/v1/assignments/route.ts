import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const url = new URL(request.url);
    const offeringId = url.searchParams.get('offeringId');

    if (!offeringId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'offeringId is required' }, { status: 400 });
    }

    const assignments = await db.assignment.findMany({
      where: { offeringId },
      orderBy: { dueDate: 'asc' },
      include: {
        _count: { select: { submissions: true } }
      }
    });

    return NextResponse.json({ data: assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Only reps or admins can create assignments
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to create assignments' }, { status: 403 });
    }

    const { offeringId, title, description, dueDate, type } = await request.json();

    if (!offeringId || !title || !dueDate || !type) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing required fields' }, { status: 400 });
    }

    const assignment = await db.assignment.create({
      data: {
        offeringId,
        title,
        description,
        dueDate: new Date(dueDate),
        type,
      }
    });

    // Notify all enrolled students
    const enrollments = await db.enrollment.findMany({ where: { offeringId } });
    if (enrollments.length > 0) {
      await db.notification.createMany({
        data: enrollments.map((e) => ({
          userId: e.studentId,
          type: 'NEW_ASSIGNMENT',
          title: `New Assignment: ${title}`,
          content: `A new ${type.toLowerCase()} has been posted. Due: ${new Date(dueDate).toLocaleDateString()}`,
          isRead: false,
          referenceId: assignment.id,
        })),
      });
    }

    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
