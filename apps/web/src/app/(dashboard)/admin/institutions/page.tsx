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
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>Platform admin</div>
          <h1>Institutions</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Onboarded universities and schools on Talora.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-primary">
            + Onboard institution
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="ledger-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="Search institutions" 
            className="input"
            style={{ flex: 1 }} 
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="ledger-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Inst. ID</th>
              <th>Name</th>
              <th>Primary domain</th>
              <th>Enrolled users</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockInstitutions.map((inst, i) => (
              <tr key={i}>
                <td data-label="Inst. ID" className="reg-number">{inst.id}</td>
                <td data-label="Name" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{inst.name}</td>
                <td data-label="Primary domain" style={{ color: 'var(--color-text-secondary)' }}>{inst.domain}</td>
                <td data-label="Enrolled users" style={{ color: 'var(--color-text-primary)' }}>{inst.students.toLocaleString()}</td>
                <td data-label="Status">
                  {inst.status === 'Active' ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-subtle">Inactive</span>
                  )}
                </td>
                <td data-label="Actions" style={{ textAlign: 'right' }}>
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
