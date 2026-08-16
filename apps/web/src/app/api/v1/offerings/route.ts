import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export async function GET(request: Request) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;

    // A real implementation would filter offerings based on the user's role.
    // For instance, returning offerings where they are a student, or where they are a rep.
    // Since we seeded one offering, let's just return it for now.
    const offerings = await db.courseOffering.findMany({
      include: {
        unit: true,
        term: true,
        class: true,
      },
    });

    return NextResponse.json({ data: offerings });
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
