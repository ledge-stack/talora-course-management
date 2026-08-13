import React from 'react';

export default function RosterPage() {
  const mockStudents = [
    { id: 'YY00712345', name: 'Sarah Chen', email: 'schen@university.edu', group: 'Group 4', status: 'Registered' },
    { id: 'YY00712346', name: 'Mark Liu', email: 'mliu@university.edu', group: 'Unassigned', status: 'Registered' },
    { id: 'YY00712347', name: 'James Doe', email: 'jdoe@university.edu', group: 'Group 2', status: 'Dropped' },
    { id: 'YY00712348', name: 'Elena Smith', email: 'esmith@university.edu', group: 'Group 4', status: 'Registered' },
    { id: 'YY00712349', name: 'Kwame Osei', email: 'kosei@university.edu', group: 'Unassigned', status: 'Registered' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Course Roster</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Manage enrolled students for this offering. Total: 42 students.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-secondary">
            Export CSV
          </button>
          <button className="btn-primary">
            + Import Roster
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="Search by name, ID, or email..." 
            style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }} 
          />
          <select style={{ padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}>
            <option>All Statuses</option>
            <option>Registered</option>
            <option>Dropped</option>
          </select>
          <select style={{ padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}>
            <option>All Groups</option>
            <option>Assigned</option>
            <option>Unassigned</option>
          </select>
        </div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Showing 1-5 of 42
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Student ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Group</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map((student, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-base)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{student.id}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)' }}>{student.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>{student.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {student.group === 'Unassigned' ? (
                    <span className="badge badge-warning">Unassigned</span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--color-primary-transparent)', color: 'var(--color-primary)' }}>{student.group}</span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {student.status === 'Registered' ? (
                    <span className="badge badge-success">Registered</span>
                  ) : (
                    <span className="badge badge-danger">Dropped</span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button style={{ color: 'var(--color-text-secondary)', padding: '0.25rem', cursor: 'pointer' }}>•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
