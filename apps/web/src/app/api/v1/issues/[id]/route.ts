import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');
    if (!isRep) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Only Class Reps can update issues' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['OPEN', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Invalid status' }, { status: 400 });
    }

    const issue = await db.issue.update({
      where: { id: params.id },
      data: { status }
    });

    if (issue.studentId) {
      await db.notification.create({
        data: {
          userId: issue.studentId,
          title: `Issue Updated`,
          message: `Your issue "${issue.title}" is now marked as ${status}.`,
          isRead: false,
        }
      });
    }

    return NextResponse.json({ data: issue });
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
