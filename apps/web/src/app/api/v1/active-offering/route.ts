import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { offeringId } = await request.json();
    
    if (!offeringId) {
      return NextResponse.json({ error: 'offeringId is required' }, { status: 400 });
    }

    // Set cookie with a 30-day expiration
    cookies().set('active_offering_id', offeringId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting active offering:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
