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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '2rem', gap: '0' }}>
            {/* Animated icon */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px',
              background: 'linear-gradient(135deg, var(--color-primary), #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '2rem',
              boxShadow: '0 20px 60px -10px rgba(99,102,241,0.4)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>

            <h1 className="font-display" style={{ fontSize: '2.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
              Welcome to Talora
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Your account is set up. Enroll in your course units next, so we can assign you to the right groups and show you relevant assignments and announcements.
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '420px', marginBottom: '2.5rem', textAlign: 'left' }}>
              {[
                { n: '1', text: 'Go to Course Enrollment below' },
                { n: '2', text: 'Select the course units you are studying this semester' },
                { n: '3', text: 'Return here — your dashboard will be fully loaded' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0 }}>
                    {step.n}
                  </div>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>{step.text}</span>
                </div>
              ))}
            </div>

            <a href="/enroll" className="btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', textDecoration: 'none', borderRadius: '12px' }}>
              Enroll in course units →
            </a>
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const nextDeadline = dbDeadlines[0] ?? null;
  const nextDeadlineDays = nextDeadline
    ? Math.ceil((new Date(nextDeadline.dueDate).getTime() - Date.now()) / 86400000)
    : null;
  const latestNotif = recentActivity[0] ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Masthead ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-rule)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
            {today}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', lineHeight: 1.05, margin: 0 }}>
            {offeringName}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-teal)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-teal)', display: 'inline-block', boxShadow: '0 0 8px var(--color-accent-teal)', animation: 'pulse-glow 3s ease-in-out infinite' }} />
            Live
          </div>
          {isRepOrAdmin && (
            <a href="/announcements" className="btn-primary" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}>
              + Announce
            </a>
          )}
        </div>
      </div>

      {/* ── Three dispatch cards ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

        {/* My Group dispatch */}
        <div className="ledger-panel" style={{ padding: '1.375rem 1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.875rem' }}>
            My group
          </div>
          {myGroup ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
                {myGroup.name}
              </div>
              <div className="roster-dots" style={{ marginBottom: '1rem' }}>
                {myGroup.memberships.map((_: any, i: number) => (
                  <span key={i} className="roster-dot filled complete" />
                ))}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                  {myGroup.memberships.length} members
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {myGroup.memberships.slice(0, 4).map((m: any) => {
                  const isLeader = m.studentId === myGroup.leaderId;
                  return (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLeader ? 'var(--color-accent-violet)' : 'var(--color-primary)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.student?.fullName || '—'}</span>
                      {isLeader && <span className="leader-tag">Lead</span>}
                    </div>
                  );
                })}
                {myGroup.memberships.length > 4 && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>+{myGroup.memberships.length - 4} more</div>
                )}
              </div>
              <a href="/groups" className="btn-inline" style={{ marginTop: '1rem', display: 'inline-flex' }}>View group →</a>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>No group yet.</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>You haven't claimed a slot in any group for this offering.</div>
              <a href="/groups" className="btn-primary" style={{ alignSelf: 'flex-start', fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}>Find a group →</a>
            </div>
          )}
        </div>

        {/* Next deadline dispatch */}
        <div className="ledger-panel" style={{ padding: '1.375rem 1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.875rem' }}>
            Next deadline
          </div>
          {nextDeadline ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: '0.625rem', lineHeight: 1.2 }}>
                {nextDeadline.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  color: nextDeadlineDays! <= 2 ? 'var(--color-danger)' : 'var(--color-primary)',
                  lineHeight: 1,
                }}>{nextDeadlineDays}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>days left</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>{new Date(nextDeadline.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              {nextDeadlineDays! <= 2 && (
                <span className="stamp stamp-danger" style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>Urgent</span>
              )}
              <a href="/assignments" className="btn-inline" style={{ display: 'inline-flex' }}>View assignment →</a>
            </>
          ) : (
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>
              No upcoming deadlines.
            </div>
          )}
        </div>

        {/* Latest notification dispatch */}
        <div className="ledger-panel" style={{ padding: '1.375rem 1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.875rem' }}>
            Latest update
          </div>
          {latestNotif ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {latestNotif.title}
              </div>
              {latestNotif.body && (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                  {latestNotif.body}
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                {new Date(latestNotif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              <a href="/notifications" className="btn-inline" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>All notifications →</a>
            </>
          ) : (
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>
              Nothing new.
            </div>
          )}
        </div>
      </div>

      {/* ── Class Overview — Reps / Admins ───────────────────── */}
      {isRepOrAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Class overview
            </div>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-rule)' }} />
            <span className="badge badge-violet">Rep</span>
          </div>

          {/* KPI ledger row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {kpis.filter(k => k.key !== 'deadlines').map(kpi => (
              <a key={kpi.key} href={kpi.link.startsWith('/') ? kpi.link : '#'} className="ledger-panel hover-border" style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', textDecoration: 'none', transition: 'border-color 0.15s ease' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{kpi.label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: '0.125rem' }}>{kpi.sub}</div>
              </a>
            ))}
          </div>

          {/* Submission progress */}
          {latestAssignment && (
            <div className="ledger-panel" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Submission progress</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                    {latestAssignment.title}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--color-accent-teal)', lineHeight: 1 }}>
                    {stats.totalEnrolled ? Math.round((stats.totalSubmissions / stats.totalEnrolled) * 100) : 0}%
                  </span>
                  <a href="/assignments" className="btn-inline">View →</a>
                </div>
              </div>
              <div className="progress-track" style={{ height: '5px', marginBottom: '0.75rem' }}>
                <div className="progress-fill" style={{ width: `${stats.totalEnrolled ? (stats.totalSubmissions / stats.totalEnrolled) * 100 : 0}%`, background: 'var(--color-accent-teal)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                <span><span style={{ color: 'var(--color-accent-teal)' }}>●</span> {stats.totalSubmissions} submitted</span>
                <span><span style={{ color: 'var(--color-danger)' }}>●</span> {stats.totalEnrolled - stats.totalSubmissions} pending</span>
                <span><span style={{ color: 'var(--color-text-muted)' }}>●</span> {stats.totalEnrolled} total</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Recent notifications (non-rep fallback) ──────────── */}
      {!isRepOrAdmin && recentActivity.length > 1 && (
        <div className="ledger-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Notifications</div>
            <a href="/notifications" className="btn-inline" style={{ fontSize: '0.75rem' }}>All →</a>
          </div>
          <div>
            {recentActivity.slice(1).map((item: any) => (
              <div key={item.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-rule)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--border-strong)', flexShrink: 0, marginTop: '0.375rem' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
