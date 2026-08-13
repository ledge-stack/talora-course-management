import React from 'react';

export const metadata = {
  title: 'Dashboard — Talora',
  description: 'Class Representative dashboard for group coordination, submissions, and issue tracking.',
};

const kpis = [
  {
    key: 'ungrouped',
    value: '6',
    label: 'Ungrouped Students',
    sub: 'Students not yet assigned to any group',
    link: 'Assign to groups',
    color: 'var(--color-danger)',
    iconBg: 'var(--color-danger-bg)',
    badge: { text: '+2 since yesterday', cls: 'badge-danger' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    key: 'incomplete',
    value: '3',
    label: 'Incomplete Groups',
    sub: 'Groups below minimum required size',
    link: 'Review groups',
    color: 'var(--color-warning)',
    iconBg: 'var(--color-warning-bg)',
    badge: { text: 'Min size: 4', cls: 'badge-warning' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
    ),
  },
  {
    key: 'requests',
    value: '4',
    label: 'Pending Change Requests',
    sub: 'Group reassignment requests awaiting approval',
    link: 'Review requests',
    color: 'var(--color-warning)',
    iconBg: 'var(--color-warning-bg)',
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    ),
  },
  {
    key: 'issues',
    value: '7',
    label: 'Unresolved Issues',
    sub: 'Open issues requiring your attention',
    link: 'Go to issues',
    color: 'var(--color-danger)',
    iconBg: 'var(--color-danger-bg)',
    badge: { text: '3 high priority', cls: 'badge-danger' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    ),
  },
  {
    key: 'deadlines',
    value: '4',
    label: 'Upcoming Deadlines',
    sub: 'Deadlines in the next 14 days',
    link: 'View schedule',
    color: 'var(--color-primary)',
    iconBg: 'var(--color-primary-transparent)',
    badge: { text: 'Next: Nov 14', cls: 'badge-primary' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
  },
  {
    key: 'submissions',
    value: '28',
    label: 'Submissions Received',
    sub: 'Out of 42 students — Assignment 3 open',
    link: 'View submissions',
    color: 'var(--color-success)',
    iconBg: 'var(--color-success-bg)',
    badge: { text: '67% submitted', cls: 'badge-success' },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    ),
  },
];

const recentActivity = [
  { id: 1, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, bg: 'var(--color-success-bg)', color: 'var(--color-success)', text: 'Sarah Chen joined Group 4', time: '2 min ago' },
  { id: 2, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>, bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', text: 'Group change request from Mark Liu', time: '18 min ago' },
  { id: 3, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', text: 'New issue: Lab room booking conflict', time: '1 hr ago' },
  { id: 4, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, bg: 'var(--color-success-bg)', color: 'var(--color-success)', text: 'Kwame Osei submitted Assignment 3', time: '2 hr ago' },
];

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Fall 2024 · CS-301 · Data Structures — Section A</p>
        </div>
        <div className="page-header-actions">
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-subtle)', padding: '0.4375rem 0.875rem', borderRadius: 'var(--radius-md)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>
            Last synced 3 min ago
          </span>
          <button className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
            New Announcement
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {kpis.map(kpi => (
          <div key={kpi.key} className="glass-panel kpi-card">
            <div className="kpi-card-header">
              <div className="kpi-icon" style={{ background: kpi.iconBg, color: kpi.color }}>
                {kpi.icon}
              </div>
              {kpi.badge && <span className={`badge ${kpi.badge.cls}`}>{kpi.badge.text}</span>}
            </div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-sublabel">{kpi.sub}</div>
            <a href="#" className="kpi-link">{kpi.link} →</a>
          </div>
        ))}
      </section>

      {/* Activity + Deadlines */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Recent Activity</h2>
            <a href="#" style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}>View all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentActivity.map(item => (
              <div key={item.id} className="activity-item">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{item.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Upcoming Deadlines</h2>
            <a href="#" style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}>Calendar</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Assignment 3 Submission', date: '2d left', urgency: 'var(--color-danger)', badgeCls: 'badge-danger' },
              { label: 'Group Formation Deadline', date: 'Nov 16', urgency: 'var(--color-text-muted)', badgeCls: '' },
              { label: 'Tutorial Presentation', date: 'Nov 22', urgency: 'var(--color-text-muted)', badgeCls: '' },
            ].map((dl) => (
              <div key={dl.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dl.urgency, flexShrink: 0 }} />
                  {dl.label}
                </div>
                <span className={dl.badgeCls ? `badge ${dl.badgeCls}` : ''} style={!dl.badgeCls ? { fontSize: '0.75rem', color: 'var(--color-text-muted)' } : undefined}>
                  {dl.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submission Progress */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
              Assignment 3 — Submission Progress
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Due Nov 14 · 28 of 42 students submitted</div>
          </div>
          <a href="#" style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}>View all submissions</a>
        </div>

        <div className="progress-track" style={{ height: '8px', marginBottom: '1rem' }}>
          <div className="progress-fill" style={{ width: '67%', background: 'var(--color-success)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-success)' }}>●</span> Submitted: <strong style={{ color: 'var(--color-text-primary)' }}>28</strong>
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-danger)' }}>●</span> Pending: <strong style={{ color: 'var(--color-text-primary)' }}>14</strong>
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>●</span> Total: <strong style={{ color: 'var(--color-text-primary)' }}>42</strong>
            </span>
          </div>
          <span style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>67%</span>
        </div>
      </div>
    </div>
  );
}
