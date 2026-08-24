import React from 'react';
import { cookies } from 'next/headers';
import { getActiveOfferingId } from '@/lib/getActiveOffering';
import { db } from '@talora/database';
import { headers } from 'next/headers';
import CreateAssignmentButton from './CreateAssignmentButton';
import AssignmentsListClient from './AssignmentsListClient';

export default async function AssignmentsPage() {
  const scopeHeader = headers().get('x-user-scope');
  let assignments: any[] = [];
  let offeringName = 'No Offering Selected';
  let offeringId = '';
  let canCreate = false;

  if (scopeHeader) {
    try {
      const payload = JSON.parse(scopeHeader);
      canCreate = payload.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

      const activeOfferingId = getActiveOfferingId();
      
      let offering = null;
      if (activeOfferingId) {
        offering = await db.courseOffering.findUnique({
          where: { id: activeOfferingId },
          include: { unit: true, term: true, class: true },
        });
      }

      if (!offering) {
        offering = await db.courseOffering.findFirst({
          include: { unit: true, term: true, class: true },
        });
      }

      if (offering) {
        offeringId = offering.id;
        offeringName = `${offering.term.name} · ${offering.unit.title} · ${offering.class.name}`;
        
        const dbAssignments = await db.assignment.findMany({
          where: { offeringId: offering.id },
          orderBy: { dueDate: 'asc' },
          include: {
            _count: { select: { submissions: true } }
          }
        });



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
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">Assignments</h1>
          <p className="text-text-secondary text-sm">{offeringName} — Deadlines and submissions</p>
        </div>
        <div className="flex items-center gap-3">
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
