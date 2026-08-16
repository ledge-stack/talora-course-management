import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import CreateAssignmentButton from './CreateAssignmentButton';
import AssignmentsListClient from './AssignmentsListClient';

export default async function AssignmentsPage() {
  const token = cookies().get('talora_token')?.value;
  let assignments: any[] = [];
  let offeringName = 'No Offering Selected';
  let offeringId = '';
  let canCreate = false;

  if (token) {
    try {
      await verifyJwt(token);
      
      const payload = await verifyJwt(token);
      canCreate = payload.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

      const offering = await db.courseOffering.findFirst({
        include: { unit: true, term: true, class: true },
      });

      if (offering) {
        offeringId = offering.id;
        offeringName = `${offering.term.name} · ${offering.unit.code} · ${offering.class.name}`;
        
        const dbAssignments = await db.assignment.findMany({
          where: { offeringId: offering.id },
          orderBy: { dueDate: 'asc' },
          include: {
            _count: { select: { submissions: true } }
          }
        });

        const totalEnrolled = await db.enrollment.count({ where: { offeringId: offering.id } });

        assignments = dbAssignments.map(a => {
          const isPast = new Date(a.dueDate) < new Date();
          return {
            id: a.id,
            title: a.title,
            description: a.description,
            type: a.type,
            rawDueDate: a.dueDate,
            dueDate: new Date(a.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            isPast,
            submissionsCount: a._count.submissions
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const totalEnrolledForProps = offeringId ? await db.enrollment.count({ where: { offeringId } }) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Assignments</h1>
          <p>{offeringName} — Deadlines and submissions</p>
        </div>
        <div className="page-header-actions">
          {offeringId && (
            <CreateAssignmentButton offeringId={offeringId} disabled={!canCreate} />
          )}
        </div>
      </header>

      {/* Main Content Card */}
      <AssignmentsListClient assignments={assignments} totalEnrolled={totalEnrolledForProps} />
    </div>
  );
}
