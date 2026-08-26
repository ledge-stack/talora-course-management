import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // We don't check for specific roles here, because any user should be able to edit their own profile
    // But we should verify the user is editing their own ID
    const scope = JSON.parse(scopeHeader);
    
    // Check if caller is platform admin
    const caller = await db.user.findUnique({
      where: { id: scope.userId },
      include: { roles: true }
    });
    const isPlatformAdmin = caller?.roles.some(r => r.role === 'PLATFORM_ADMIN');

    if (scope.userId !== params.id && !isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, email, studentNumber, registrationNumber, phoneNumber, acceptedTerms, isActive } = body;

    const currentUser = await db.user.findUnique({ where: { id: params.id } });
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check permissions for isActive
    let finalIsActive = undefined;
    if (isActive !== undefined) {
      if (!isPlatformAdmin) {
        return NextResponse.json({ error: 'Forbidden. Only admins can toggle account status.' }, { status: 403 });
      }
      finalIsActive = isActive;
    }

    let emailChanged = false;

    if (email && email !== currentUser.email) {
      emailChanged = true;
    }

    const updateData: any = {
      fullName, 
      email, 
      studentNumber, 
      registrationNumber,
      phoneNumber,
      ...(finalIsActive !== undefined ? { isActive: finalIsActive } : {})
    };

    if (acceptedTerms !== undefined) {
      updateData.acceptedTerms = acceptedTerms;
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ data: user, emailChanged });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email, student number, or registration number already in use' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const scope = JSON.parse(scopeHeader);
    
    const caller = await db.user.findUnique({
      where: { id: scope.userId },
      include: { roles: true }
    });
    const isPlatformAdmin = caller?.roles.some(r => r.role === 'PLATFORM_ADMIN');

    if (scope.userId !== params.id && !isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete user (Prisma cascade will handle the rest)
    await db.user.delete({
      where: { id: params.id }
    });

    // Clear auth cookie if deleting self
    if (scope.userId === params.id) {
      cookies().delete('talora_token');
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (err: any) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
