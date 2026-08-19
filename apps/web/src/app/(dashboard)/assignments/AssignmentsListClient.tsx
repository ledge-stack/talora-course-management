'use client';

import React, { useState } from 'react';
import ViewAssignmentButton from './ViewAssignmentButton';

type SortColumn = 'title' | 'type' | 'dueDate' | 'submissions';
type SortDirection = 'asc' | 'desc';

export default function AssignmentsListClient({ assignments, totalEnrolled }: { assignments: any[], totalEnrolled: number }) {
  const [sortCol, setSortCol] = useState<SortColumn>('dueDate');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const getSortIcon = (col: SortColumn) => {
    if (sortCol !== col) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const getBadgeClass = (type: string) => {
    switch(type) {
      case 'HOMEWORK': return 'badge-primary';
      case 'PROJECT': return 'badge-warning';
      case 'EXAM': return 'badge-danger';
      default: return 'badge-subtle';
    }
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    let valA = a[sortCol];
    let valB = b[sortCol];
    
    // Convert dates for proper sorting
    if (sortCol === 'dueDate') {
      valA = new Date(a.rawDueDate).getTime();
      valB = new Date(b.rawDueDate).getTime();
    } else if (sortCol === 'submissions') {
      valA = a.submissionsCount;
      valB = b.submissionsCount;
    }

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '25%', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('title')}>
                Title <span style={{ marginLeft: '4px' }}>{getSortIcon('title')}</span>
              </th>
              <th style={{ width: '15%', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('type')}>
                Type <span style={{ marginLeft: '4px' }}>{getSortIcon('type')}</span>
              </th>
              <th style={{ width: '20%', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('dueDate')}>
                Due Date <span style={{ marginLeft: '4px' }}>{getSortIcon('dueDate')}</span>
              </th>
              <th style={{ width: '25%', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('submissions')}>
                Submissions <span style={{ marginLeft: '4px' }}>{getSortIcon('submissions')}</span>
              </th>
              <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssignments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No assignments found for this offering.
                </td>
              </tr>
            ) : (
              sortedAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>{assignment.title}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {assignment.description || 'No description provided.'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(assignment.type)}`}>{assignment.type}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: assignment.isPast ? 'var(--color-danger)' : 'var(--color-text-primary)', fontSize: '0.875rem' }}>
                        {assignment.dueDate}
                      </span>
                      {assignment.isPast && (
                        <span className="badge badge-danger">Overdue</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      {assignment.submissionsCount} / {totalEnrolled} submissions
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ViewAssignmentButton id={assignment.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
