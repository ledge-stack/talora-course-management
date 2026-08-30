import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { headers } from 'next/headers';
import SubmissionClient from './SubmissionClient';
import Link from 'next/link';

export default async function AssignmentDetailsPage({ params }: { params: { id: string } }) {
  const scopeHeader = headers().get('x-user-scope');
  let assignment: any = null;
  let submission: any = null;

  if (scopeHeader) {
    try {
      const payload = JSON.parse(scopeHeader);
      
      const dbAssignment = await db.assignment.findUnique({
        where: { id: params.id },
        include: { offering: { include: { unit: true, class: true } } }
      });

      if (dbAssignment) {
        assignment = {
          id: dbAssignment.id,
          title: dbAssignment.title,
          description: dbAssignment.description,
          type: dbAssignment.type,
          dueDate: new Date(dbAssignment.dueDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
          isPast: new Date(dbAssignment.dueDate) < new Date(),
          offeringName: `${dbAssignment.offering.unit.title} · ${dbAssignment.offering.class.name}`
        };

        const dbSubmission = await db.submission.findFirst({
          where: { assignmentId: dbAssignment.id, studentId: payload.userId }
        });

        if (dbSubmission) {
          submission = {
            id: dbSubmission.id,
            fileUrl: dbSubmission.fileUrl,
            submittedAt: new Date(dbSubmission.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!assignment) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
        <header className="page-header">
          <div>
            <h1>Assignment not found</h1>
            <p>This assignment doesn't exist, or you don't have permission to view it.</p>
          </div>
        </header>
        <Link href="/assignments" className="btn-secondary" style={{ width: 'fit-content', textDecoration: 'none' }}>Back to assignments</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header className="page-header">
        <div>
          <Link href="/assignments" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            &larr; Back to assignments
          </Link>
          <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>{assignment.type}</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {assignment.title}
          </h1>
          <p>{assignment.offeringName}</p>
        </div>
      </header>

      <div className="ledger-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.5rem' }}>Description</div>
          <div style={{ color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {assignment.description}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: assignment.isPast ? 'var(--color-danger-bg)' : 'var(--color-bg-surface-hover)', borderRadius: '8px', color: assignment.isPast ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <strong>Due:</strong> <span className="reg-number" style={{ color: 'inherit' }}>{assignment.dueDate}</span>
          {assignment.isPast && <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>Overdue</span>}
        </div>
      </div>

      <SubmissionClient assignmentId={assignment.id} initialSubmission={submission} />
    </div>
  );
}
