import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const scope = JSON.parse(scopeHeader) as UserScope;

    const group = await db.group.findUnique({
      where: { id: params.id },
      include: {
        memberships: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentNumber: true,
                phoneNumber: true
              }
            }
          }
        }
      }
    });

    if (!group) return NextResponse.json({ code: 'NOT_FOUND', message: 'Group not found' }, { status: 404 });

    // Ensure the user is allowed to view members. For now, we'll assume any logged in user can see who is in a group
    // This allows the transfer leadership modal and view members modal to work for the whole class.
    
    const members = group.memberships.map(m => ({
      id: m.student.id,
      fullName: m.student.fullName,
      studentNumber: m.student.studentNumber,
      phoneNumber: m.student.phoneNumber,
      isLeader: m.student.id === group.leaderId
    }));

    return NextResponse.json({ data: members });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
