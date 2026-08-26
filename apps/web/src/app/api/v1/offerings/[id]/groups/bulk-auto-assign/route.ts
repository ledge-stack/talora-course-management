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
    const offeringId = params.id;
    
    // Verify user is rep or admin
    const isAdminOrRep = payload.roles.some((r: any) => 
      r.role === 'PLATFORM_ADMIN' || (r.role === 'CLASS_REPRESENTATIVE' && r.classId)
    );
    
    if (!isAdminOrRep) {
      return NextResponse.json({ message: 'Forbidden: Only Class Reps can bulk assign' }, { status: 403 });
    }
    
    const offering = await db.courseOffering.findUnique({
      where: { id: offeringId }
    });
    
    if (!offering) return NextResponse.json({ message: 'Offering not found' }, { status: 404 });

    // Find all enrolled students who are NOT in a group for this offering
    const enrollments = await db.enrollment.findMany({
      where: { offeringId },
      include: { student: true }
    });
    
    const memberships = await db.groupMembership.findMany({
      where: { offeringId }
    });
    
    const groupedStudentIds = new Set(memberships.map(m => m.studentId));
    
    let ungroupedStudents = enrollments
      .filter(e => !groupedStudentIds.has(e.studentId))
      .map(e => e.student);
      
    if (ungroupedStudents.length === 0) {
      return NextResponse.json({ message: 'No ungrouped students to assign' });
    }

    // Shuffle the students to ensure truly random allocation, especially when creating new groups
    for (let i = ungroupedStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ungroupedStudents[i], ungroupedStudents[j]] = [ungroupedStudents[j], ungroupedStudents[i]];
    }

    // Find all groups that are open, not locked, and have space
    const groups = await db.group.findMany({
      where: {
        offeringId,
        isOpen: true,
        isLocked: false
      },
      include: {
        _count: { select: { memberships: true, placeholders: true } }
      }
    });

    let openGroupsWithSpace = groups
      .map(g => ({
        ...g,
        totalMembers: g._count.memberships + g._count.placeholders
      }))
      .filter(g => g.totalMembers < offering.maxGroupSize);

    let assignedCount = 0;
    let newGroupsCreated = 0;

    for (const student of ungroupedStudents) {
      if (openGroupsWithSpace.length > 0) {
        // Pick a random open group
        const randomIndex = Math.floor(Math.random() * openGroupsWithSpace.length);
        const targetGroup = openGroupsWithSpace[randomIndex];
        
        await db.groupMembership.create({
          data: {
            groupId: targetGroup.id,
            studentId: student.id,
            offeringId
          }
        });
        assignedCount++;
        
        // Update local count
        targetGroup.totalMembers++;
        if (targetGroup.totalMembers >= offering.maxGroupSize) {
          // Remove from openGroupsWithSpace
          openGroupsWithSpace.splice(randomIndex, 1);
        }
      } else {
        // No open groups available, create a new one
        const existingGroups = await db.group.findMany({
          where: { offeringId },
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
        const groupName = `Group ${maxNumber + 1}`;

        const newGroup = await db.group.create({
          data: {
            name: groupName,
            offeringId,
            leaderId: student.id,
            isOpen: true,
            memberships: {
              create: {
                studentId: student.id,
                offeringId
              }
            }
          }
        });
        
        // Also assign a GROUP_LEADER role
        await db.userRole.create({
          data: {
            userId: student.id,
            role: 'GROUP_LEADER',
            classId: offering.classId
          }
        });
        
        assignedCount++;
        newGroupsCreated++;
        
        // Add to open groups pool if it has space
        if (offering.maxGroupSize > 1) {
          openGroupsWithSpace.push({
            ...newGroup,
            _count: { memberships: 1, placeholders: 0 },
            totalMembers: 1
          } as any);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully assigned ${assignedCount} students. Created ${newGroupsCreated} new groups.` 
    });

  } catch (error: any) {
    console.error('Error in bulk auto-assign:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
