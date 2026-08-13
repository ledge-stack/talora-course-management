import React from 'react';

export default function GroupsPage() {
  const mockGroups = [
    { id: '1', name: 'Group 1', leader: 'Sarah Chen', members: 5, status: 'Complete' },
    { id: '2', name: 'Group 2', leader: 'James Doe', members: 3, status: 'Incomplete' },
    { id: '3', name: 'Study Buddies', leader: 'Elena Smith', members: 4, status: 'Complete' },
    { id: '4', name: 'Alpha Coders', leader: 'Kwame Osei', members: 5, status: 'Complete' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Groups</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Manage student groups, policies, and formation status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-secondary">
            ⚙️ Group Policies
          </button>
          <button className="btn-primary">
            + Create Group
          </button>
        </div>
      </header>

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Total Groups</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>12</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Grouped Students</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>36 / 42</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Incomplete Groups</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>3</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Pending Requests</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>4</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search groups..." 
            style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }} 
          />
          <select style={{ padding: '0.625rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}>
            <option>All Statuses</option>
            <option>Complete</option>
            <option>Incomplete</option>
          </select>
        </div>
      </div>

      {/* Grid of Groups */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {mockGroups.map(group => (
          <div key={group.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-text-primary)' }}>{group.name}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Leader: {group.leader}</div>
              </div>
              {group.status === 'Complete' ? (
                <span className="badge badge-success">Complete</span>
              ) : (
                <span className="badge badge-warning">Incomplete</span>
              )}
            </div>
            
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Capacity</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{group.members} / 5</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-strong)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(group.members / 5) * 100}%`, height: '100%', background: group.status === 'Complete' ? 'var(--color-success)' : 'var(--color-warning)', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button className="btn-secondary" style={{ flex: 1 }}>View Details</button>
              <button className="btn-secondary" style={{ padding: '0.5rem' }}>•••</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
