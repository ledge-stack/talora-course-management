import React from 'react';

export default function AdminUsersPage() {
  const mockUsers = [
    { id: 'USR-992', name: 'Dr. Alan Turing', email: 'aturing@ut.edu.ng', roles: ['Platform Admin', 'Instructor'], lastActive: '2 mins ago' },
    { id: 'USR-993', name: 'Grace Hopper', email: 'ghopper@ut.edu.ng', roles: ['Instructor'], lastActive: '1 hr ago' },
    { id: 'USR-994', name: 'Sarah Chen', email: 'schen@ut.edu.ng', roles: ['Class Rep', 'Student'], lastActive: '5 mins ago' },
    { id: 'USR-995', name: 'Mark Liu', email: 'mliu@ut.edu.ng', roles: ['Student'], lastActive: 'Yesterday' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>User Directory & Roles</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Manage platform users and their global role assignments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-primary">
            + Invite User
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }} 
          />
          <select style={{ padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}>
            <option>All Roles</option>
            <option>Platform Admin</option>
            <option>Instructor</option>
            <option>Class Rep</option>
            <option>Student</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-base)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>User ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Roles</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Last Active</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-base)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{user.id}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-primary)' }}>{user.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {user.roles.map(role => (
                      <span key={role} className="badge" style={{ background: role === 'Platform Admin' ? 'var(--color-danger-bg)' : 'var(--color-primary-transparent)', color: role === 'Platform Admin' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>{user.lastActive}</td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <button className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Edit Roles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
