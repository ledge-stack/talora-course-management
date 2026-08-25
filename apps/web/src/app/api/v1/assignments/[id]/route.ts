import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Only reps or admins can edit assignments
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to edit assignments' }, { status: 403 });
    }

    const assignmentId = params.id;
    const body = await request.json();
    const { title, description, dueDate, type } = body;

    const existingAssignment = await db.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!existingAssignment) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Assignment not found' }, { status: 404 });
    }

    const updatedAssignment = await db.assignment.update({
      where: { id: assignmentId },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        type: type !== undefined ? type : undefined,
      }
    });

    return NextResponse.json({ data: updatedAssignment }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    
    // Only reps or admins can delete assignments
    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    if (!isRep) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Not authorized to delete assignments' }, { status: 403 });
    }

    const assignmentId = params.id;

    const existingAssignment = await db.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!existingAssignment) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Assignment not found' }, { status: 404 });
    }

    await db.assignment.delete({
      where: { id: assignmentId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: error.message }, { status: 500 });
  }
}
