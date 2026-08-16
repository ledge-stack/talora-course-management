import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import CreateGroupButton from './CreateGroupButton';
import GroupsClient from './GroupsClient';

export default async function GroupsPage() {
  const token = cookies().get('talora_token')?.value;
  let groups: any[] = [];
  let offeringName = 'No Offering Selected';
  let stats = {
    totalStudents: 0,
    studentsInGroups: 0,
    totalGroups: 0,
    minGroupSize: 4,
    maxGroupSize: 6,
  };
  let offeringId = '';
  let canCreateGroup = false;

  if (token) {
    try {
      await verifyJwt(token);
      
      const offering = await db.courseOffering.findFirst({
        include: { unit: true, term: true, class: true },
      });

      if (offering) {
        offeringId = offering.id;
        offeringName = `${offering.term.name} · ${offering.unit.code} · ${offering.class.name}`;
        stats.minGroupSize = offering.minGroupSize;
        stats.maxGroupSize = offering.maxGroupSize;
        
        const dbGroups = await db.group.findMany({
          where: { offeringId: offering.id },
          include: {
            _count: { select: { memberships: true } },
          },
        });

        stats.totalGroups = dbGroups.length;

        const leaderIds = dbGroups.map(g => g.leaderId);
        const leaders = await db.user.findMany({
          where: { id: { in: leaderIds } },
          select: { id: true, fullName: true },
        });
        const leaderMap = new Map(leaders.map(l => [l.id, l.fullName]));

        groups = dbGroups.map(g => ({
          id: g.id,
          name: g.name,
          leader: leaderMap.get(g.leaderId) || 'Unknown',
          membersCount: g._count.memberships,
          status: g.status,
          capacity: stats.maxGroupSize
        }));

        stats.totalStudents = await db.enrollment.count({ where: { offeringId: offering.id } });
        stats.studentsInGroups = await db.groupMembership.count({ where: { offeringId: offering.id } });

        const payload = await verifyJwt(token);
        const isStudent = payload.roles.some(r => r.role === 'STUDENT');
        if (isStudent) {
          const userMembership = await db.groupMembership.findUnique({
            where: { studentId_offeringId: { studentId: payload.userId, offeringId: offering.id } }
          });
          canCreateGroup = !userMembership;
        } else {
          // Reps can create groups
          canCreateGroup = payload.roles.some(r => r.role === 'CLASS_REPRESENTATIVE');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  const overviewStats = [
    { label: 'Total Groups', value: stats.totalGroups },
    { label: 'Students in Groups', value: `${stats.studentsInGroups} / ${stats.totalStudents}` },
    { label: 'Ungrouped Students', value: stats.totalStudents - stats.studentsInGroups, isWarning: (stats.totalStudents - stats.studentsInGroups) > 0 },
    { label: 'Group Rules', value: `Min ${stats.minGroupSize} · Max ${stats.maxGroupSize}` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Group Management</h1>
          <p>{offeringName}</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter Rules
          </button>
          {offeringId && (
            <CreateGroupButton offeringId={offeringId} disabled={!canCreateGroup} />
          )}
        </div>
      </header>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        {overviewStats.map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              {stat.label}
            </div>
            <div style={{ color: stat.isWarning ? 'var(--color-danger)' : 'var(--color-text-primary)', fontSize: '1.5rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <GroupsClient groups={groups} />
    </div>
  );
}
