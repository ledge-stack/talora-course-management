import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';
import { sendEmail } from '@/lib/email';

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
    const enrollments = await db.enrollment.findMany({ 
      where: { offeringId },
      include: { student: { select: { email: true } } }
    });
    
    if (enrollments.length > 0) {
      await db.notification.createMany({
        data: enrollments.map((e) => ({
          userId: e.studentId,
          title: `New Assignment: ${title}`,
          message: `A new ${type.toLowerCase()} has been posted. Due: ${new Date(dueDate).toLocaleDateString()}`,
          isRead: false,
        })),
      });

      // Send email blast
      const bccList = enrollments.map(e => e.student.email).filter(Boolean);
      if (bccList.length > 0) {
        sendEmail({
          to: bccList, // Since our email utility uses an array or string, it will put them in the 'to' field. Brevo handles array of strings well.
          subject: `New Assignment Posted: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>New Assignment: ${title}</h2>
              <p>A new <strong>${type.toLowerCase()}</strong> has been posted for your class.</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleString()}</p>
              ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
              <br/>
              <a href="https://talora-course-management.vercel.app/assignments" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View on Talora</a>
            </div>
          `
        }).catch(err => console.error('Failed to send assignment blast:', err));
      }
    }

    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
