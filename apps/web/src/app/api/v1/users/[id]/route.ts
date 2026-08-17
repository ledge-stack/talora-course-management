import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const scopeHeader = req.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // We don't check for specific roles here, because any user should be able to edit their own profile
    // But we should verify the user is editing their own ID
    const scope = JSON.parse(scopeHeader);
    if (scope.userId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, email, studentNumber, registrationNumber } = body;

    const user = await db.user.update({
      where: { id: params.id },
      data: { 
        fullName, 
        email, 
        studentNumber, 
        registrationNumber 
      }
    });

    return NextResponse.json({ data: user });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email, student number, or registration number already in use' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
