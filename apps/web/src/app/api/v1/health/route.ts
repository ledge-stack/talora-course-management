import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Talora Next.js API / BFF',
    timestamp: new Date().toISOString(),
    apiVersion: 'v1',
  });
}
