import React from 'react';
import { resolveAuthorizedOffering } from '@/lib/getActiveOffering';
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

      const offering = await resolveAuthorizedOffering(payload);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* ── Masthead ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-rule)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
            {offeringName}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', lineHeight: 1.1, margin: 0 }}>
            Assignments
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {offeringId && (
            <CreateAssignmentButton offeringId={offeringId} disabled={!canCreate} />
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <AssignmentsListClient assignments={assignments} totalEnrolled={totalEnrolledForProps} canManage={canCreate} />
    </div>
  );
}
