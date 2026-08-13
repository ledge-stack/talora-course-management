import React from 'react';

export default function AssignmentsPage() {
  const mockAssignments = [
    { id: '1', title: 'Assignment 1: Trees and Graphs', deadline: 'Oct 15, 2026', submissions: 42, total: 42, status: 'Closed' },
    { id: '2', title: 'Assignment 2: Sorting Algorithms', deadline: 'Oct 28, 2026', submissions: 40, total: 42, status: 'Closed' },
    { id: '3', title: 'Assignment 3: Dynamic Programming', deadline: 'Nov 14, 2026', submissions: 28, total: 42, status: 'Open' },
    { id: '4', title: 'Final Project Submission', deadline: 'Dec 10, 2026', submissions: 0, total: 42, status: 'Upcoming' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Assignments & Submissions</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Track and manage group submissions for this offering.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-primary">
            + New Assignment
          </button>
        </div>
      </header>

      {/* Grid of Assignments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockAssignments.map(assignment => (
          <div key={assignment.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-text-primary)' }}>{assignment.title}</h3>
                {assignment.status === 'Open' && <span className="badge badge-success">Open</span>}
                {assignment.status === 'Closed' && <span className="badge" style={{ background: 'var(--border-strong)', color: 'var(--color-text-muted)' }}>Closed</span>}
                {assignment.status === 'Upcoming' && <span className="badge badge-warning">Upcoming</span>}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', display: 'flex', gap: '1.5rem' }}>
                <span><span style={{ color: 'var(--color-text-muted)' }}>Deadline:</span> {assignment.deadline}</span>
                <span><span style={{ color: 'var(--color-text-muted)' }}>Submissions:</span> {assignment.submissions} / {assignment.total}</span>
              </div>
            </div>
            
            <div style={{ width: '200px', marginRight: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>
                <span>Progress</span>
                <span>{Math.round((assignment.submissions / assignment.total) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-strong)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(assignment.submissions / assignment.total) * 100}%`, height: '100%', background: assignment.status === 'Open' ? 'var(--color-success)' : 'var(--color-text-muted)', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary">View Submissions</button>
              <button className="btn-secondary" style={{ padding: '0.5rem' }}>•••</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
