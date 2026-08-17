import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import CreateIssueButton from './CreateIssueButton';
import IssueActionButtons from './IssueActionButtons';

export default async function IssuesPage() {
  const token = cookies().get('talora_token')?.value;
  let issues: any[] = [];
  let offeringName = 'No Offering Selected';
  let offeringId = '';
  let isRep = false;

  if (token) {
    try {
      await verifyJwt(token);
      
      const payload = await verifyJwt(token);
      isRep = payload.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');

      const activeOfferingId = cookies().get('active_offering_id')?.value;
      
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
        offeringName = `${offering.term.name} · ${offering.unit.code} · ${offering.class.name}`;
        
        const whereClause: any = { offeringId: offering.id };
        if (!isRep) {
          whereClause.studentId = payload.userId;
        }

        const dbIssues = await db.issue.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: {
            student: { select: { fullName: true } }
          }
        });

        issues = dbIssues.map(i => ({
          id: i.id,
          title: i.title,
          description: i.description,
          category: i.category,
          status: i.status,
          author: i.student.fullName,
          date: new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'badge-danger';
      case 'TRIAGED': return 'badge-warning';
      case 'RESOLVED': return 'badge-success';
      default: return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Issues Tracker</h1>
          <p>{offeringName} — {isRep ? 'All Issues' : 'My Issues'}</p>
        </div>
        <div className="page-header-actions">
          {offeringId && (
            <CreateIssueButton offeringId={offeringId} />
          )}
        </div>
      </header>

      {/* Main Content Card */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Date</th>
                <th style={{ width: '25%' }}>Title</th>
                <th style={{ width: '25%' }}>Author</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No issues found.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id}>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>{issue.date}</td>
                    <td>
                      <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>{issue.title}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {issue.description}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{issue.author}</td>
                    <td>
                      <span className="badge badge-subtle">{issue.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(issue.status)}`}>{issue.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isRep ? (
                        <IssueActionButtons issueId={issue.id} currentStatus={issue.status} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {issue.status === 'RESOLVED' ? 'Resolved' : 'Pending Review'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
