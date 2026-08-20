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

    const groups = await db.group.findMany({
      where: { offeringId: params.id },
      include: {
        offering: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    // Need to fetch leader names
    const leaderIds = groups.map(g => g.leaderId);
    const leaders = await db.user.findMany({
      where: { id: { in: leaderIds } },
      select: { id: true, fullName: true },
    });
    const leaderMap = new Map(leaders.map(l => [l.id, l.fullName]));

    const mapped = groups.map(g => ({
      id: g.id,
      name: g.name,
      leader: leaderMap.get(g.leaderId) || 'Unknown',
      members: g._count.memberships,
      capacity: g.offering.maxGroupSize,
      status: g.status,
    }));

    return NextResponse.json({ data: mapped });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;

    const offering = await db.courseOffering.findUnique({
      where: { id: params.id }
    });

    if (!offering) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Offering not found' }, { status: 404 });
    }

    const isStudent = scope.roles.some(r => r.role === 'STUDENT');
    if (isStudent) {
      const existingMembership = await db.groupMembership.findUnique({
        where: {
          studentId_offeringId: {
            studentId: scope.userId,
            offeringId: offering.id
          }
        }
      });

      if (existingMembership) {
        return NextResponse.json({ code: 'CONFLICT', message: 'You are already in a group for this offering' }, { status: 409 });
      }
    }

    const existingGroups = await db.group.findMany({
      where: { offeringId: offering.id },
      select: { name: true }
    });
    let maxNumber = 0;
    for (const g of existingGroups) {
      const match = g.name.match(/Group (\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }
    const autoName = `Group ${maxNumber + 1}`;

    // Prisma casts string to enum automatically
    const newGroup = await db.group.create({
      data: {
        name: autoName,
        offeringId: offering.id,
        leaderId: scope.userId,
        status: 'FORMING',
        memberships: {
          create: [
            { studentId: scope.userId, offeringId: offering.id }
          ]
        }
      },
    });

    return NextResponse.json({ data: newGroup }, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

