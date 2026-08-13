import React from 'react';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Welcome back, Leon 👋</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
          Here is what's happening with your classes today.
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--color-warning)' }}>
          <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ungrouped Students</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>42</div>
          <button className="btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>View Roster</button>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--color-danger)' }}>
          <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Incomplete Groups</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>8</div>
          <button className="btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>Review Groups</button>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--color-primary)' }}>
          <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Group Requests</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>15</div>
          <button className="btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>Manage Requests</button>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--color-success)' }}>
          <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Issues</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>3</div>
          <button className="btn-primary" style={{ width: '100%', fontSize: '0.875rem' }}>View Issues</button>
        </div>
      </section>

      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Upcoming Deadlines</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Group Formation Deadline</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>CS101 - Fall 2026</div>
            </div>
            <div style={{ padding: '0.25rem 0.75rem', background: 'var(--color-danger)', color: 'white', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              Tomorrow
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Assignment 1 Submission</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>CS201 - Data Structures</div>
            </div>
            <div style={{ padding: '0.25rem 0.75rem', background: 'var(--color-warning)', color: '#000', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              In 3 days
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
