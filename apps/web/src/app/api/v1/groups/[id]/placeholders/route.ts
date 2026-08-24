import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('talora_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyJwt(token);
    const groupId = params.id;
    
    // Verify user is leader or admin
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        offering: true,
        _count: { select: { memberships: true, placeholders: true } }
      }
    });
    
    if (!group) return NextResponse.json({ message: 'Group not found' }, { status: 404 });
    
    const isAdminOrRep = payload.roles.some((r: any) => r.role === 'PLATFORM_ADMIN' || r.role === 'CLASS_REPRESENTATIVE');
    if (group.leaderId !== payload.userId && !isAdminOrRep) {
      return NextResponse.json({ message: 'Forbidden: Only leaders can reserve spots' }, { status: 403 });
    }
    
    // Check capacity
    const totalMembers = group._count.memberships + group._count.placeholders;
    if (totalMembers >= group.offering.maxGroupSize) {
      return NextResponse.json({ message: 'Group is at maximum capacity' }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, email } = body;
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }
    
    const placeholder = await db.groupPlaceholder.create({
      data: {
        groupId,
        name: name.trim(),
        email: email?.trim() || null
      }
    });
    
    return NextResponse.json({ message: 'Placeholder added', data: placeholder });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('talora_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyJwt(token);
    const groupId = params.id;
    
    const url = new URL(request.url);
    const placeholderId = url.searchParams.get('placeholderId');
    if (!placeholderId) return NextResponse.json({ message: 'placeholderId required' }, { status: 400 });
    
    const group = await db.group.findUnique({ where: { id: groupId } });
    if (!group) return NextResponse.json({ message: 'Group not found' }, { status: 404 });
    
    const isAdminOrRep = payload.roles.some((r: any) => r.role === 'PLATFORM_ADMIN' || r.role === 'CLASS_REPRESENTATIVE');
    if (group.leaderId !== payload.userId && !isAdminOrRep) {
      return NextResponse.json({ message: 'Forbidden: Only leaders can modify placeholders' }, { status: 403 });
    }
    
    await db.groupPlaceholder.delete({
      where: { id: placeholderId }
    });
    
    return NextResponse.json({ message: 'Placeholder removed' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
