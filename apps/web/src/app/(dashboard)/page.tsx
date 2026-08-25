import React from 'react';
import { headers, cookies } from 'next/headers';
import { db } from '@talora/database';
import { getCachedOfferingKPIs } from '@/lib/cached-queries';
import type { UserScope } from '@talora/auth';
import { resolveAuthorizedOffering } from '@/lib/getActiveOffering';

export const dynamic = 'force-dynamic';

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
      const scope = JSON.parse(scopeHeader) as UserScope;

      const offering = await resolveAuthorizedOffering(scope);

      if (!offering) {
        return (
          <div className="flex flex-col gap-8 items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 rounded-full bg-primary-transparent flex items-center justify-center text-primary mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h2 className="text-2xl font-semibold text-text-primary">Welcome to Talora!</h2>
            <p className="text-text-secondary max-w-md">You haven&apos;t enrolled in any course units yet. Please visit the Course Enrollment page to select the units you intend to study.</p>
            <a href="/enroll" className="btn-primary no-underline">Go to Course Enrollment</a>
          </div>
        );
      }

      offeringName = `${offering.term.name} · ${offering.unit.title} · ${offering.class.name}`;

      const [kpiData, activityData, myGroupData] = await Promise.all([
        getCachedOfferingKPIs(offering.id, offering.classId, offering.termId),
        db.notification.findMany({
          where: { userId: scope.userId },
          orderBy: { createdAt: 'desc' },
          take: 4,
        }),
        db.groupMembership.findFirst({
          where: { offeringId: offering.id, studentId: scope.userId },
          include: { group: { include: { memberships: { include: { student: true } } } } },
        }),
      ]);

      stats = {
        ungrouped: kpiData.ungrouped,
        incomplete: kpiData.incomplete,
        requests: kpiData.requests,
        issues: kpiData.issues,
        deadlines: kpiData.deadlines,
        totalEnrolled: kpiData.totalEnrolled,
        totalSubmissions: kpiData.totalSubmissions,
      };
      recentActivity = activityData;
      dbDeadlines = kpiData.dbDeadlines;
      latestAssignment = kpiData.latestAssignment;
      myGroup = myGroupData?.group ?? null;

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
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
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
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>),
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
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>),
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
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
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
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
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
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
    },
  ];

  const userRoles = scopeHeader ? JSON.parse(scopeHeader).roles?.map((r: any) => r.role) || [] : [];
  const isRepOrAdmin = userRoles.some((r: string) => r.includes('REPRESENTATIVE') || r.includes('ADMIN'));

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>{offeringName}</p>
        </div>
        <div className="page-header-actions">
          <span className="text-text-muted text-[0.8125rem] flex items-center gap-2 border border-border-subtle px-3.5 py-1.5 rounded-md">
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

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity — spans 2 cols */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[0.9375rem] font-semibold text-text-primary">My Notifications &amp; Activity</h3>
            <a href="/notifications" className="text-primary text-[0.8125rem] font-medium">View all</a>
          </div>
          <div className="flex flex-col">
            {recentActivity.length === 0 ? (
              <div className="text-text-muted text-sm">No recent activity.</div>
            ) : recentActivity.map((item: any) => (
              <div key={item.id} className="activity-item">
                <div className="w-8 h-8 rounded-full bg-primary-transparent text-primary flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div>
                  <div className="text-sm text-text-primary">{item.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines — spans 1 col */}
        <div className="lg:col-span-1 glass-panel p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[0.9375rem] font-semibold text-text-primary">Upcoming Deadlines</h3>
            <a href="/timetable" className="text-primary text-[0.8125rem] font-medium">Calendar</a>
          </div>
          <div className="flex flex-col gap-3.5">
            {dbDeadlines.length === 0 ? (
              <div className="text-text-muted text-sm">No upcoming deadlines.</div>
            ) : dbDeadlines.map((dl: any) => {
              const diffDays = Math.ceil((new Date(dl.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              const urgency = diffDays <= 2 ? 'var(--color-danger)' : 'var(--color-primary)';
              const badgeCls = diffDays <= 2 ? 'badge-danger' : 'badge-primary';
              return (
                <div key={dl.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: urgency, flexShrink: 0 }} />
                    {dl.title}
                  </div>
                  <span className={`badge ${badgeCls}`}>{diffDays}d left</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Group — full width */}
        <div className="lg:col-span-3 glass-panel p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[0.9375rem] font-semibold text-text-primary">My Group</h3>
            <a href="/groups" className="text-primary text-[0.8125rem] font-medium">View all groups</a>
          </div>
          {myGroup ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {myGroup.name.charAt(0)}
                </div>
                <div>
                  <div className="text-base font-semibold text-text-primary">{myGroup.name}</div>
                  <div className="text-[0.8125rem] text-text-secondary">{myGroup.memberships.length} members</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {myGroup.memberships.map((m: any) => (
                  <div key={m.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-sm text-text-primary font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.student?.fullName || 'Unknown Student'}</span>
                    {m.studentId === myGroup.leaderId && <span className="badge badge-primary" style={{ marginLeft: '8px', flexShrink: 0, fontSize: '0.65rem' }}>Leader</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div className="text-text-muted text-sm" style={{ marginBottom: '1rem' }}>You are not currently in a group for this offering.</div>
              <a href="/groups" className="btn-primary">Find a Group</a>
            </div>
          )}
        </div>

        {/* Class Overview — Reps/Admins only */}
        {isRepOrAdmin && (
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-text-primary">Class Overview</h2>
              <span className="badge badge-warning">Class Rep Privileges Active</span>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
              {kpis.filter(k => k.key !== 'deadlines').map(kpi => (
                <div key={kpi.key} className="glass-panel kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-icon" style={{ background: kpi.iconBg, color: kpi.color }}>{kpi.icon}</div>
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

            <div className="glass-panel p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-text-primary mb-1">
                    {latestAssignment ? latestAssignment.title : 'Assignments'} — Class Submission Progress
                  </h3>
                  <div className="text-[0.8125rem] text-text-secondary">
                    {latestAssignment ? `Due ${new Date(latestAssignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ` : ''}
                    {stats.totalSubmissions} of {stats.totalEnrolled} students submitted
                  </div>
                </div>
                <a href="/assignments" className="text-primary text-[0.8125rem] font-medium">View all submissions</a>
              </div>
              <div className="progress-track h-2 mb-4">
                <div className="progress-fill" style={{ width: `${stats.totalEnrolled ? (stats.totalSubmissions/stats.totalEnrolled)*100 : 0}%`, background: 'var(--color-success)' }} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-5">
                  <span className="text-text-secondary"><span className="text-success">●</span> Submitted: <strong className="text-text-primary">{stats.totalSubmissions}</strong></span>
                  <span className="text-text-secondary"><span className="text-danger">●</span> Pending: <strong className="text-text-primary">{stats.totalEnrolled - stats.totalSubmissions}</strong></span>
                  <span className="text-text-secondary"><span className="text-text-muted">●</span> Total: <strong className="text-text-primary">{stats.totalEnrolled}</strong></span>
                </div>
                <span className="font-extrabold text-text-primary font-display text-base">
                  {stats.totalEnrolled ? Math.round((stats.totalSubmissions/stats.totalEnrolled)*100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
