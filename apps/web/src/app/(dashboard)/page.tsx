import React from 'react';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
            Fall 2024 • CS-301 • Data Structures — Section A
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-subtle)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
            🔄 Last synced 3 min ago
          </span>
          <button className="btn-primary">
            + New Announcement
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Card 1: Ungrouped */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
              👤
            </div>
            <span className="badge badge-danger">2 since yesterday</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-danger)', lineHeight: 1, marginBottom: '0.5rem' }}>6</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Ungrouped Students</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Students not yet assigned to any group</div>
          <a href="#" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', transition: 'color 0.2s' }}>
            Assign to groups →
          </a>
        </div>

        {/* Card 2: Incomplete */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
              📚
            </div>
            <span className="badge badge-warning">Min size: 4</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-warning)', lineHeight: 1, marginBottom: '0.5rem' }}>3</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Incomplete Groups</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Groups below the minimum required size</div>
          <a href="#" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
            Review groups →
          </a>
        </div>

        {/* Card 3: Requests */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
              🔄
            </div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-warning)', lineHeight: 1, marginBottom: '0.5rem' }}>4</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Pending Change Requests</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Group reassignment requests awaiting approval</div>
          <a href="#" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
            Review requests →
          </a>
        </div>

        {/* Card 4: Issues */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
              ⚠️
            </div>
            <span className="badge badge-danger">3 high priority</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-danger)', lineHeight: 1, marginBottom: '0.5rem' }}>7</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Unresolved Issues</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Open issues requiring your attention</div>
          <a href="#" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
            Go to issues →
          </a>
        </div>

        {/* Card 5: Deadlines */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              ⏰
            </div>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>Next: Nov 14</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '0.5rem' }}>4</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Upcoming Deadlines</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Deadlines in the next 14 days</div>
          <a href="#" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
            View schedule →
          </a>
        </div>

        {/* Card 6: Submissions */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              📤
            </div>
            <span className="badge badge-success">67% submitted</span>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-success)', lineHeight: 1, marginBottom: '0.5rem' }}>28</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Submissions Received</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Out of 42 students — Assignment 3 open</div>
          <a href="#" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
            View submissions →
          </a>
        </div>
      </section>

      {/* Split Layout: Recent Activity & Deadlines */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Recent Activity</h2>
            <a href="#" style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>View all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Sarah Chen joined Group 4</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>2 min ago</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔄</div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Group change request from Mark Liu</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>18 min ago</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚠️</div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>New issue: Lab room booking conflict</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>1 hr ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>Upcoming Deadlines</h2>
            <a href="#" style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>See calendar</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-danger)' }}></div>
                Assignment 3 Submission
              </div>
              <span className="badge badge-danger" style={{ background: 'transparent' }}>2d left</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-muted)' }}></div>
                Group Formation Deadline
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Nov 16</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>Assignment 3 — Submission Progress</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Due Nov 14 · 28 of 42 students submitted</div>
          </div>
          <a href="#" style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>View all submissions</a>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--border-strong)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ width: '67%', height: '100%', background: 'var(--color-success)', borderRadius: '4px' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}><span style={{ color: 'var(--color-success)' }}>●</span> Submitted: <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>28</span></span>
            <span style={{ color: 'var(--color-text-secondary)' }}><span style={{ color: 'var(--color-danger)' }}>●</span> Pending: <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>14</span></span>
            <span style={{ color: 'var(--color-text-secondary)' }}><span style={{ color: 'var(--color-text-muted)' }}>●</span> Total enrolled: <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>42</span></span>
          </div>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>67%</span>
        </div>
      </div>
    </div>
  );
}
