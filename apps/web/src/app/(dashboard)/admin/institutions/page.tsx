import React from 'react';

export default function InstitutionsPage() {
  const mockInstitutions = [
    { id: 'INST-001', name: 'University of Technology', domain: 'ut.edu.ng', students: 15420, status: 'Active' },
    { id: 'INST-002', name: 'National Science Academy', domain: 'nsa.edu', students: 8200, status: 'Active' },
    { id: 'INST-003', name: 'City College', domain: 'citycollege.org', students: 3100, status: 'Inactive' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Institutions</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Platform administration for onboarded universities and schools.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-primary">
            + Onboard Institution
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="Search institutions..." 
            style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }} 
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Inst ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Primary Domain</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Enrolled Users</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockInstitutions.map((inst, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{inst.id}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)' }}>{inst.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>{inst.domain}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)' }}>{inst.students.toLocaleString()}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {inst.status === 'Active' ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--border-strong)', color: 'var(--color-text-muted)' }}>Inactive</span>
                  )}
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
