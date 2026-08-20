import React from 'react';
import { cookies, headers } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';
import CreateGroupButton from './CreateGroupButton';
import GroupsClient from './GroupsClient';

export default async function GroupsPage() {
  const token = cookies().get('talora_token')?.value;
  let groups: any[] = [];
  let offeringName = 'No Offering Selected';
  const stats = {
    totalStudents: 0,
    studentsInGroups: 0,
    totalGroups: 0,
    minGroupSize: 4,
    maxGroupSize: 6,
  };
  let offeringId = '';
  let canCreateGroup = false;
  let isRep = false;
  let currentUserId = '';

  const scopeHeader = headers().get('x-user-scope');
  if (scopeHeader) {
    const scope = JSON.parse(scopeHeader);
    currentUserId = scope.userId;
    isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
  }

  if (token) {
    try {
      await verifyJwt(token);
      
      const activeOfferingId = cookies().get('active_offering_id')?.value;
      
      let offering = null;
      if (activeOfferingId) {
        offering = await db.courseOffering.findUnique({
          where: { id: activeOfferingId },
          include: { unit: true, term: true, class: true },
        });
      }

      if (!offering) {
        offering = await db.courseOffering.findFirst({
          include: { unit: true, term: true, class: true },
        });
      }

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
          leaderId: g.leaderId,
          membersCount: g._count.memberships,
          status: g.status,
          capacity: stats.maxGroupSize,
          isOpen: g.isOpen
        }));

        stats.totalStudents = await db.enrollment.count({ where: { offeringId: offering.id } });
        stats.studentsInGroups = await db.groupMembership.count({ where: { offeringId: offering.id } });

        if (scopeHeader) {
          const scope = JSON.parse(scopeHeader);
          const isStudent = scope.roles.some((r: any) => r.role === 'STUDENT');
          if (isStudent) {
            const userMembership = await db.groupMembership.findUnique({
              where: { studentId_offeringId: { studentId: scope.userId, offeringId: offering.id } }
            });
            canCreateGroup = !userMembership;
          } else {
            // Reps can create groups
            canCreateGroup = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE');
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Fetch pending requests for the offering
  let pendingRequests: any[] = [];
  if (offeringId) {
    const rawRequests = await db.groupChangeRequest.findMany({
      where: { group: { offeringId }, status: 'PENDING' },
      include: { group: { select: { id: true, leaderId: true } } }
    });

    if (rawRequests.length > 0) {
      const studentIds = rawRequests.map(r => r.studentId);
      const students = await db.user.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, fullName: true, email: true }
      });
      const studentMap = new Map(students.map(s => [s.id, s]));

      pendingRequests = rawRequests.map(r => ({
        id: r.id,
        groupId: r.groupId,
        groupLeaderId: r.group.leaderId,
        studentId: r.studentId,
        studentName: studentMap.get(r.studentId)?.fullName || 'Unknown Student',
        studentEmail: studentMap.get(r.studentId)?.email,
        reason: r.reason
      }));
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

          {offeringId && (
            <CreateGroupButton offeringId={offeringId} disabled={!canCreateGroup} />
          )}
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid-4-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
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

      <GroupsClient 
        groups={groups} 
        isUserInGroup={!canCreateGroup} 
        currentUserId={currentUserId}
        isRep={isRep}
        offeringId={offeringId}
        pendingRequests={pendingRequests}
        minGroupSize={stats.minGroupSize}
        maxGroupSize={stats.maxGroupSize}
      />
    </div>
  );
}
