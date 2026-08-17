import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // We can just clear the cookie and redirect to login
  const response = NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  response.cookies.set('talora_token', '', { maxAge: 0, path: '/' });
  return response;
}
