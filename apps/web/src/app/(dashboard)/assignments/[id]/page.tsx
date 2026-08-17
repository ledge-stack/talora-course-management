import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import SubmissionClient from './SubmissionClient';
import Link from 'next/link';

export default async function AssignmentDetailsPage({ params }: { params: { id: string } }) {
  const token = cookies().get('talora_token')?.value;
  let assignment: any = null;
  let submission: any = null;

  if (token) {
    try {
      const payload = await verifyJwt(token);
      
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
          offeringName: `${dbAssignment.offering.unit.code} · ${dbAssignment.offering.class.name}`
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
            <h1>Assignment Not Found</h1>
            <p>This assignment does not exist or you do not have permission to view it.</p>
          </div>
        </header>
        <Link href="/assignments" className="btn-secondary" style={{ width: 'fit-content', textDecoration: 'none' }}>Back to Assignments</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header className="page-header">
        <div>
          <Link href="/assignments" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            &larr; Back to Assignments
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {assignment.title}
            <span className={`badge ${assignment.type === 'HOMEWORK' ? 'badge-primary' : assignment.type === 'PROJECT' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {assignment.type}
            </span>
          </h1>
          <p>{assignment.offeringName}</p>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Description</h3>
          <div style={{ color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {assignment.description}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: assignment.isPast ? 'var(--color-danger-bg)' : 'var(--color-bg-surface-hover)', borderRadius: '8px', color: assignment.isPast ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <strong>Due Date:</strong> {assignment.dueDate}
          {assignment.isPast && <span className="badge badge-danger" style={{ marginLeft: 'auto' }}>Overdue</span>}
        </div>
      </div>

      <SubmissionClient assignmentId={assignment.id} initialSubmission={submission} isPast={assignment.isPast} />
    </div>
  );
}
