import React from 'react';
import { headers } from 'next/headers';
import { db } from '@talora/database';

const recentActivity = [
  { id: 1, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, bg: 'var(--color-success-bg)', color: 'var(--color-success)', text: 'Sarah Chen joined Group 4', time: '2 min ago' },
  { id: 2, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>, bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', text: 'Group change request from Mark Liu', time: '18 min ago' },
  { id: 3, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', text: 'New issue: Lab room booking conflict', time: '1 hr ago' },
  { id: 4, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, bg: 'var(--color-success-bg)', color: 'var(--color-success)', text: 'Kwame Osei submitted Assignment 3', time: '2 hr ago' },
];

export default async function Dashboard() {
  const scopeHeader = headers().get('x-user-scope');
  let offeringName = 'No Offering Selected';
  let stats = {
    ungrouped: 0,
    incomplete: 0,
    requests: 0,
    issues: 0,
    deadlines: 0,
    totalEnrolled: 0,
    totalSubmissions: 0,
  };

  let recentActivity: any[] = [];
  let dbDeadlines: any[] = [];
  let myGroup: any = null;
  let latestAssignment: any = null;

  if (scopeHeader) {
    try {
      const scope = JSON.parse(scopeHeader);
      
      // Fetch the first offering for the dashboard
      const offering = await db.courseOffering.findFirst({
        include: { unit: true, term: true, class: true },
      });

      if (offering) {
        offeringName = `${offering.term.name} · ${offering.unit.code} · ${offering.class.name}`;
        
        // Calculate real KPIs based on DB
        const totalEnrolled = await db.enrollment.count({ where: { offeringId: offering.id } });
        const studentsInGroups = await db.groupMembership.count({ where: { offeringId: offering.id } });
        const ungrouped = totalEnrolled - studentsInGroups;

        const groups = await db.group.findMany({
          where: { offeringId: offering.id },
          include: { _count: { select: { memberships: true } } },
        });
        const incomplete = groups.filter(g => g._count.memberships < offering.minGroupSize).length;

        const requests = await db.groupChangeRequest.count({ where: { status: 'PENDING' } });
        const issues = await db.issue.count({ where: { offeringId: offering.id, status: 'OPEN' } });
        const deadlines = await db.assignment.count({ where: { offeringId: offering.id, dueDate: { gte: new Date() } } });
        const totalSubmissions = await db.submission.count({ where: { assignment: { offeringId: offering.id } } });

        stats = {
          ungrouped, incomplete, requests, issues, deadlines, totalEnrolled, totalSubmissions,
        };

        recentActivity = await db.notification.findMany({
          where: { userId: scope.userId },
          orderBy: { createdAt: 'desc' },
          take: 4
        });

        dbDeadlines = await db.assignment.findMany({
          where: { offeringId: offering.id, dueDate: { gte: new Date() } },
          orderBy: { dueDate: 'asc' },
          take: 3
        });

        const studentMembership = await db.groupMembership.findFirst({
          where: { offeringId: offering.id, userId: scope.userId },
          include: { group: { include: { memberships: { include: { user: true } } } } }
        });
        if (studentMembership) {
          myGroup = studentMembership.group;
        }

        latestAssignment = await db.assignment.findFirst({
          where: { offeringId: offering.id, dueDate: { gte: new Date() } },
          orderBy: { dueDate: 'asc' }
        });
      }

    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  }

  const kpis = [
    {
      key: 'ungrouped',
      value: stats.ungrouped.toString(),
      label: 'Ungrouped Students',
      sub: 'Students not yet assigned to any group',
      link: 'Assign to groups',
      color: 'var(--color-danger)',
      iconBg: 'var(--color-danger-bg)',
      badge: { text: 'Needs action', cls: 'badge-danger' },
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      ),
    },
    {
      key: 'incomplete',
      value: stats.incomplete.toString(),
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
      value: stats.requests.toString(),
      label: 'Pending Change Requests',
      sub: 'Group reassignment requests awaiting approval',
      link: '/groups/requests',
      color: 'var(--color-warning)',
      iconBg: 'var(--color-warning-bg)',
      badge: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
      ),
    },
    {
      key: 'issues',
      value: stats.issues.toString(),
      label: 'Unresolved Issues',
      sub: 'Open issues requiring your attention',
      link: 'Go to issues',
      color: 'var(--color-danger)',
      iconBg: 'var(--color-danger-bg)',
      badge: null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      ),
    },
    {
      key: 'deadlines',
      value: stats.deadlines.toString(),
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
      value: stats.totalSubmissions.toString(),
      label: 'Submissions Received',
      sub: `Out of ${stats.totalEnrolled} students — ${latestAssignment ? latestAssignment.title : 'No active assignments'}`,
      link: 'View submissions',
      color: 'var(--color-success)',
      iconBg: 'var(--color-success-bg)',
      badge: { text: `${stats.totalEnrolled ? Math.round((stats.totalSubmissions/stats.totalEnrolled)*100) : 0}% submitted`, cls: 'badge-success' },
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      ),
    },
  ];

  const userRoles = scopeHeader ? JSON.parse(scopeHeader).roles?.map((r: any) => r.role) || [] : [];
  const isRepOrAdmin = userRoles.some((r: string) => r.includes('REPRESENTATIVE') || r.includes('ADMIN'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{offeringName}</p>
        </div>
        <div className="page-header-actions">
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-subtle)', padding: '0.4375rem 0.875rem', borderRadius: 'var(--radius-md)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3"/></svg>
            Live synced
          </span>
          {isRepOrAdmin && (
            <button className="btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
              New Announcement
            </button>
          )}
        </div>
      </header>

      {/* --- MY PERSONAL VIEW (All Users) --- */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>My Student Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          
          {/* Recent Activity */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>My Notifications & Activity</h3>
              <a href="/notifications" style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}>View all</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentActivity.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No recent activity.</div>
              ) : recentActivity.map((item: any) => (
                <div key={item.id} className="activity-item">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Upcoming Deadlines</h3>
              <a href="/timetable" style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}>Calendar</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {dbDeadlines.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No upcoming deadlines.</div>
              ) : dbDeadlines.map((dl: any) => {
                const diffDays = Math.ceil((new Date(dl.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                const urgency = diffDays <= 2 ? 'var(--color-danger)' : 'var(--color-primary)';
                const badgeCls = diffDays <= 2 ? 'badge-danger' : 'badge-primary';
                
                return (
                  <div key={dl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: urgency, flexShrink: 0 }} />
                      {dl.title}
                    </div>
                    <span className={`badge ${badgeCls}`}>
                      {diffDays}d left
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Group */}
          <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>My Group</h3>
              <a href="/groups" style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}>View all groups</a>
            </div>
            
            {myGroup ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.125rem' }}>
                    {myGroup.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{myGroup.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{myGroup.memberships.length} members</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {myGroup.memberships.map((m: any) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--color-bg-surface-hover)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{m.user.fullName} {m.isLeader && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Leader</span>}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed var(--border-subtle)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>You are not currently in a group for this offering.</div>
                <a href="/groups" className="btn-primary">Find a Group</a>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* --- CLASS OVERVIEW (Reps/Admins Only) --- */}
      {isRepOrAdmin && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Class Overview</h2>
            <span className="badge badge-warning">Class Rep Privileges Active</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {kpis.filter(k => k.key !== 'deadlines').map(kpi => (
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
                <a href={kpi.link.startsWith('/') ? kpi.link : '#'} className="kpi-link">
                  {kpi.link.startsWith('/') ? 'View details' : kpi.link} →
                </a>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  {latestAssignment ? latestAssignment.title : 'Assignments'} — Class Submission Progress
                </h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  {latestAssignment ? `Due ${new Date(latestAssignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ` : ''} 
                  {stats.totalSubmissions} of {stats.totalEnrolled} students submitted
                </div>
              </div>
              <a href="/assignments" style={{ color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 500 }}>View all submissions</a>
            </div>

            <div className="progress-track" style={{ height: '8px', marginBottom: '1rem' }}>
              <div className="progress-fill" style={{ width: `${stats.totalEnrolled ? (stats.totalSubmissions/stats.totalEnrolled)*100 : 0}%`, background: 'var(--color-success)' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-success)' }}>●</span> Submitted: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.totalSubmissions}</strong>
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-danger)' }}>●</span> Pending: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.totalEnrolled - stats.totalSubmissions}</strong>
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>●</span> Total: <strong style={{ color: 'var(--color-text-primary)' }}>{stats.totalEnrolled}</strong>
                </span>
              </div>
              <span style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                {stats.totalEnrolled ? Math.round((stats.totalSubmissions/stats.totalEnrolled)*100) : 0}%
              </span>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
