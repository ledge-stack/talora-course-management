import { NextRequest, NextResponse } from 'next/server';
import { db } from '@talora/database';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = cookies().get('talora_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Fetch the caller to check roles
    const caller = await db.user.findUnique({
      where: { id: payload.sub },
      include: { roles: true }
    });

    if (!caller) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPlatformAdmin = caller.roles.some(r => r.role === 'PLATFORM_ADMIN');
    if (!isPlatformAdmin) {
      return NextResponse.json({ error: 'Forbidden. Requires PLATFORM_ADMIN role.' }, { status: 403 });
    }

    // Get search param
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const roleFilter = searchParams.get('role') || '';

    // Build filter
    let whereClause: any = {
      institutionId: caller.institutionId,
    };

    if (query) {
      whereClause.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { studentNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (roleFilter && roleFilter !== 'ALL') {
      whereClause.roles = {
        some: {
          role: roleFilter
        }
      };
    }

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        roles: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // limit to 100 for MVP
    });

    // Strip out passwordHash and return
    const safeUsers = users.map(u => {
      const { passwordHash, resetToken, resetTokenExpires, verificationToken, verificationTokenExpires, ...safe } = u;
      return safe;
    });

    return NextResponse.json({ data: safeUsers }, { status: 200 });

  } catch (error) {
    console.error('Fetch Users API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
