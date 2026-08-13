import React from 'react';

export const metadata = {
  title: 'Groups — Talora',
  description: 'Manage student groups, policies, and formation status for your offering.',
};

const mockGroups = [
  { id: 'GRP-001', name: 'Group 1',      leader: 'Sarah Chen',  members: 5, capacity: 5, status: 'Complete'   },
  { id: 'GRP-002', name: 'Group 2',      leader: 'James Doe',   members: 3, capacity: 5, status: 'Incomplete' },
  { id: 'GRP-003', name: 'Study Buddies',leader: 'Elena Smith', members: 4, capacity: 5, status: 'Complete'   },
  { id: 'GRP-004', name: 'Alpha Coders', leader: 'Kwame Osei',  members: 5, capacity: 5, status: 'Complete'   },
];

export default function GroupsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Groups</h1>
          <p>Manage student groups, formation policies, and membership requests.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08"/></svg>
            Group Policies
          </button>
          <button className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Group
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Groups', value: '12', color: 'var(--color-text-primary)' },
          { label: 'Grouped Students', value: '36 / 42', color: 'var(--color-success)' },
          { label: 'Incomplete Groups', value: '3', color: 'var(--color-warning)' },
          { label: 'Pending Requests', value: '4', color: 'var(--color-primary)' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: kpi.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="toolbar">
          <div className="toolbar-search">
            <input type="text" className="input" placeholder="Search groups by name or leader..." style={{ flex: 1 }} />
            <select className="select">
              <option>All Statuses</option>
              <option>Complete</option>
              <option>Incomplete</option>
            </select>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
            {mockGroups.length} groups
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {mockGroups.map(group => {
          const fillPct = (group.members / group.capacity) * 100;
          const isComplete = group.status === 'Complete';
          return (
            <div key={group.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{group.name}</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {group.leader}
                  </div>
                </div>
                <span className={isComplete ? 'badge badge-success' : 'badge badge-warning'}>
                  {group.status}
                </span>
              </div>

              {/* Capacity */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Capacity</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{group.members} / {group.capacity}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${fillPct}%`, background: isComplete ? 'var(--color-success)' : 'var(--color-warning)' }}
                  />
                </div>
              </div>

              {/* Group ID */}
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '1rem' }}>
                {group.id}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8125rem', padding: '0.4375rem 0.75rem' }}>View Details</button>
                <button className="btn-ghost" style={{ padding: '0.4375rem 0.625rem', fontSize: '0.8125rem' }} title="More actions">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
