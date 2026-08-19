import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import { verifyPassword, signJwt } from '@talora/auth';
import type { UserScope, Role } from '@talora/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Construct the UserScope payload for the JWT
    const payload: UserScope = {
      userId: user.id,
      roles: user.roles.map(r => ({
        role: r.role as Role,
        classId: r.classId || undefined,
        // offeringId and groupId would ideally be mapped here if we expanded the UserRole model
        // For MVP, we'll keep it simple and base it off what's in the DB.
      })),
    };

    const token = await signJwt(payload);

    const response = NextResponse.json({
      message: 'Logged in successfully',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: payload.roles,
      },
    });

    // Set HttpOnly cookie
    response.cookies.set({
      name: 'talora_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}), // 30 days if rememberMe, otherwise session cookie
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
