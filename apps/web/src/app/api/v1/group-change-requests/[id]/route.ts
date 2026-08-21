import { NextResponse } from 'next/server';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scopeHeader = request.headers.get('x-user-scope');
    if (!scopeHeader) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });

    const scope = JSON.parse(scopeHeader) as UserScope;
    const body = await request.json();

    const changeRequest = await db.groupChangeRequest.findUnique({
      where: { id: params.id },
      include: {
        group: { include: { offering: true } }
      }
    });

    if (!changeRequest) return NextResponse.json({ code: 'NOT_FOUND', message: 'Request not found' }, { status: 404 });
    if (changeRequest.status !== 'PENDING') {
      return NextResponse.json({ code: 'CONFLICT', message: 'Request is already processed' }, { status: 409 });
    }

    const isRep = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
    let isLeader = changeRequest.group.leaderId === scope.userId;
    
    // For transfers, the target group leader must approve
    if (changeRequest.targetGroupId) {
      const targetGroup = await db.group.findUnique({ where: { id: changeRequest.targetGroupId } });
      if (targetGroup?.leaderId === scope.userId) {
        isLeader = true;
      } else {
        // Origin group leader cannot approve transfers, only the target can (and reps)
        isLeader = false;
      }
    }

    if (!isRep && !isLeader) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Only Class Reps or the Target Group Leader can process transfer requests' }, { status: 403 });
    }

    const { status } = body;
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Invalid status' }, { status: 400 });
    }

    // Process transaction if approved
    if (status === 'APPROVED') {
      // Check if student has a current membership in this offering
      const existingMembership = await db.groupMembership.findUnique({
        where: {
          studentId_offeringId: {
            studentId: changeRequest.studentId,
            offeringId: changeRequest.group.offeringId
          }
        }
      });

      if (!existingMembership) {
        // This is a Join Request from an ungrouped student
        const otherRequests = await db.groupChangeRequest.findMany({
          where: {
            studentId: changeRequest.studentId,
            status: 'PENDING',
            id: { not: changeRequest.id },
            group: { offeringId: changeRequest.group.offeringId }
          }
        });

        const ops: any[] = [
          db.groupMembership.create({
            data: {
              groupId: changeRequest.groupId,
              studentId: changeRequest.studentId,
              offeringId: changeRequest.group.offeringId
            }
          }),
          db.groupChangeRequest.update({
            where: { id: changeRequest.id },
            data: { status: 'APPROVED' }
          })
        ];

        if (otherRequests.length > 0) {
          ops.push(
            db.groupChangeRequest.updateMany({
              where: { id: { in: otherRequests.map(r => r.id) } },
              data: { status: 'REJECTED' }
            })
          );
        }

        await db.$transaction(ops);
      } else {
        // This student is already in a group
        if (changeRequest.targetGroupId) {
          // Transfer request
          await db.$transaction([
            db.groupMembership.delete({
              where: {
                studentId_offeringId: {
                  studentId: changeRequest.studentId,
                  offeringId: changeRequest.group.offeringId
                }
              }
            }),
            db.groupMembership.create({
              data: {
                groupId: changeRequest.targetGroupId,
                studentId: changeRequest.studentId,
                offeringId: changeRequest.group.offeringId
              }
            }),
            db.groupChangeRequest.update({
              where: { id: changeRequest.id },
              data: { status: 'APPROVED' }
            })
          ]);
        } else {
          // Remove request
          await db.$transaction([
            db.groupMembership.delete({
              where: {
                studentId_offeringId: {
                  studentId: changeRequest.studentId,
                  offeringId: changeRequest.group.offeringId
                }
              }
            }),
            db.groupChangeRequest.update({
              where: { id: changeRequest.id },
              data: { status: 'APPROVED' }
            })
          ]);
        }
      }
    } else {
      // Reject
      await db.groupChangeRequest.update({
        where: { id: changeRequest.id },
        data: { status: 'REJECTED' }
      });
    }

    return NextResponse.json({ message: 'Request processed successfully' });
  } catch (error) {
    console.error('Error processing group change request:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
