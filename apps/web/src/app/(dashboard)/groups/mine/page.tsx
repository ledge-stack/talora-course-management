import React from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { db } from '@talora/database';
import type { UserScope } from '@talora/auth';
import { resolveAuthorizedOffering } from '@/lib/getActiveOffering';

export const dynamic = 'force-dynamic';

export default async function MyGroupPage() {
  const scopeHeader = headers().get('x-user-scope');

  if (!scopeHeader) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
        <header className="page-header">
          <div>
            <h1>My group</h1>
            <p>Please log in to view your group.</p>
          </div>
        </header>
      </div>
    );
  }

  const scope = JSON.parse(scopeHeader) as UserScope;
  const offering = await resolveAuthorizedOffering(scope);

  if (!offering) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
        <header className="page-header">
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>My group</div>
            <h1>No course selected</h1>
            <p>Enroll in a course unit to see your group here.</p>
          </div>
        </header>
        <Link href="/enroll" className="btn-primary" style={{ width: 'fit-content', textDecoration: 'none' }}>
          Enroll in course units
        </Link>
      </div>
    );
  }

  const offeringName = `${offering.term.name} · ${offering.unit.title} · ${offering.class.name}`;

  const membership = await db.groupMembership.findUnique({
    where: { studentId_offeringId: { studentId: scope.userId, offeringId: offering.id } },
    include: {
      group: {
        include: {
          memberships: { include: { student: true }, orderBy: { joinedAt: 'asc' } },
        },
      },
    },
  });

  if (!membership) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
        <header className="page-header">
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>My group</div>
            <h1>{offeringName}</h1>
          </div>
        </header>
        <div className="ledger-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            You haven't claimed a slot in a group for this offering yet.
          </p>
          <Link href="/groups" className="btn-primary">Find a group</Link>
        </div>
      </div>
    );
  }

  const group = membership.group;

  // Every assignment for this offering, alongside whether THIS group has submitted it —
  // this is the query the old per-student Submission model couldn't answer correctly.
  const assignments: any[] = await db.assignment.findMany({
    where: { offeringId: offering.id },
    orderBy: { dueDate: 'asc' },
    include: {
      submissions: {
        where: { groupId: group.id },
        include: { student: { select: { fullName: true } } },
      },
    },
  });

  const now = new Date();
  const todo = assignments.filter(a => a.submissions.length === 0 && new Date(a.dueDate) >= now);
  const overdue = assignments.filter(a => a.submissions.length === 0 && new Date(a.dueDate) < now);
  const done = assignments.filter(a => a.submissions.length > 0);

  const formatDue = (d: Date) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      <header className="page-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>My group</div>
          <h1>{group.name}</h1>
          <p>{offeringName}</p>
        </div>
        <Link href="/groups" className="btn-secondary" style={{ textDecoration: 'none' }}>All groups</Link>
      </header>

      {/* Roll call */}
      <div className="ledger-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div className="eyebrow">Roll call</div>
          <div className="roster-dots">
            {group.memberships.map((_: any, i: number) => (
              <span key={i} className="roster-dot filled complete" />
            ))}
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginLeft: '0.375rem', fontFamily: 'var(--font-mono)' }}>
              {group.memberships.length} claimed
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {group.memberships.map((m: any) => {
            const isLeader = m.studentId === group.leaderId;
            return (
              <div key={m.id} className={`roster-slot claimed ${isLeader ? 'leader' : ''}`}>
                <span className="roster-slot-mark">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span className="flex-1 min-w-0 truncate font-medium">{m.student?.fullName || 'Unknown student'}</span>
                {isLeader && <span className="leader-tag shrink-0">Leader</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* To-dos */}
      <div className="ledger-panel" style={{ padding: '1.5rem' }}>
        <div className="eyebrow" style={{ marginBottom: '1.25rem' }}>To-dos</div>

        {assignments.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No assignments have been posted for this course yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {overdue.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Overdue — not submitted</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {overdue.map(a => (
                    <Link key={a.id} href={`/assignments/${a.id}`} style={{ textDecoration: 'none' }}>
                      <div className="roster-slot open" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-text-primary)' }}>
                        <span className="flex-1 min-w-0 truncate font-medium">{a.title}</span>
                        <span className="reg-number" style={{ color: 'var(--color-danger)' }}>{formatDue(a.dueDate)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {todo.length > 0 && (
              <div>
                <div className="eyebrow" style={{ marginBottom: '0.625rem' }}>Pending</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {todo.map(a => (
                    <Link key={a.id} href={`/assignments/${a.id}`} style={{ textDecoration: 'none' }}>
                      <div className="roster-slot open">
                        <span className="flex-1 min-w-0 truncate font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.title}</span>
                        <span className="reg-number">{formatDue(a.dueDate)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {done.length > 0 && (
              <div>
                <div className="eyebrow" style={{ marginBottom: '0.625rem' }}>Submitted</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {done.map(a => {
                    const sub = a.submissions[0];
                    return (
                      <Link key={a.id} href={`/assignments/${a.id}`} style={{ textDecoration: 'none' }}>
                        <div className="roster-slot claimed">
                          <span className="roster-slot-mark">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                          <span className="flex-1 min-w-0 truncate font-medium">{a.title}</span>
                          {sub?.student?.fullName && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>by {sub.student.fullName}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
