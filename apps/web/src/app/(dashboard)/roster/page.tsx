import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Course Roster — Talora',
  description: 'Manage enrolled students, assignments, and group status for your course offering.',
};

const mockStudents = [
  { id: 'YY00712345', name: 'Sarah Chen',   email: 'schen@university.edu',  group: 'Group 4',   status: 'Registered' },
  { id: 'YY00712346', name: 'Mark Liu',     email: 'mliu@university.edu',   group: 'Unassigned', status: 'Registered' },
  { id: 'YY00712347', name: 'James Doe',    email: 'jdoe@university.edu',   group: 'Group 2',   status: 'Dropped'    },
  { id: 'YY00712348', name: 'Elena Smith',  email: 'esmith@university.edu', group: 'Group 4',   status: 'Registered' },
  { id: 'YY00712349', name: 'Kwame Osei',   email: 'kosei@university.edu',  group: 'Unassigned', status: 'Registered' },
];

export default function RosterPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Course Roster</h1>
          <p>Manage enrolled students for this offering. Total: 42 students.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <Link href="/roster/import" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Import Roster
          </Link>
        </div>
      </header>

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="toolbar">
          <div className="toolbar-search">
            <input
              type="text"
              className="input"
              placeholder="Search by name, ID, or email..."
              style={{ flex: 1 }}
            />
            <select className="select">
              <option>All Statuses</option>
              <option>Registered</option>
              <option>Dropped</option>
            </select>
            <select className="select">
              <option>All Groups</option>
              <option>Assigned</option>
              <option>Unassigned</option>
            </select>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', white: 'nowrap', flexShrink: 0 }}>
            Showing 1–5 of 42
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Group</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map((student) => (
              <tr key={student.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {student.id}
                </td>
                <td style={{ fontWeight: 500 }}>{student.name}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{student.email}</td>
                <td>
                  {student.group === 'Unassigned' ? (
                    <span className="badge badge-warning">Unassigned</span>
                  ) : (
                    <span className="badge badge-primary">{student.group}</span>
                  )}
                </td>
                <td>
                  {student.status === 'Registered' ? (
                    <span className="badge badge-success">Registered</span>
                  ) : (
                    <span className="badge badge-danger">Dropped</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-ghost" style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem' }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Page 1 of 9</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>Previous</button>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
