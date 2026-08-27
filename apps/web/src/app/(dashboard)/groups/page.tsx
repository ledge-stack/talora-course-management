import React from 'react';
import { headers } from 'next/headers';
import { resolveAuthorizedOffering } from '@/lib/getActiveOffering';
import { db } from '@talora/database';
import CreateGroupButton from './CreateGroupButton';
import GroupsClient from './GroupsClient';

export default async function GroupsPage() {
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
  let userGroupId: string | null = null;

  let scope: any = null;
  const scopeHeader = headers().get('x-user-scope');
  if (scopeHeader) {
    scope = JSON.parse(scopeHeader);
    currentUserId = scope.userId;
    isRep = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
  }

  if (scope) {
    try {
      const offering = await resolveAuthorizedOffering(scope);

      if (offering) {
        offeringId = offering.id;
        offeringName = `${offering.term.name} · ${offering.unit.title} · ${offering.class.name}`;
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
          select: { id: true, fullName: true, phoneNumber: true },
        });
        const leaderMap = new Map(leaders.map(l => [l.id, l]));

        groups = dbGroups.map(g => ({
          id: g.id,
          name: g.name,
          leader: leaderMap.get(g.leaderId)?.fullName || 'Unknown',
          leaderPhone: leaderMap.get(g.leaderId)?.phoneNumber || null,
          leaderId: g.leaderId,
          membersCount: g._count.memberships,
          status: g.status,
          capacity: stats.maxGroupSize,
          isOpen: g.isOpen
        }));

        stats.totalStudents = await db.enrollment.count({ where: { offeringId: offering.id } });
        stats.studentsInGroups = await db.groupMembership.count({ 
          where: { 
            offeringId: offering.id,
            student: { enrollments: { some: { offeringId: offering.id } } }
          } 
        });

        if (scopeHeader) {
          const scope = JSON.parse(scopeHeader);
          const isStudent = scope.roles.some((r: any) => r.role === 'STUDENT');
          if (isStudent) {
            const userMembership = await db.groupMembership.findUnique({
              where: { studentId_offeringId: { studentId: scope.userId, offeringId: offering.id } }
            });
            userGroupId = userMembership?.groupId || null;
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
        select: { id: true, fullName: true, email: true, studentNumber: true }
      });
      const studentMap = new Map(students.map(s => [s.id, s]));

      pendingRequests = rawRequests.map(r => ({
        id: r.id,
        groupId: r.groupId,
        targetGroupId: r.targetGroupId,
        groupLeaderId: r.group.leaderId,
        studentId: r.studentId,
        studentName: studentMap.get(r.studentId)?.fullName || 'Unknown Student',
        studentEmail: studentMap.get(r.studentId)?.email,
        studentNumber: studentMap.get(r.studentId)?.studentNumber,
        reason: r.reason
      }));
    }
  }

  const overviewStats = [
    { label: 'Total Groups', value: stats.totalGroups },
    { label: 'Students in Groups', value: `${stats.studentsInGroups} / ${stats.totalStudents}` },
    { label: 'Ungrouped Students', value: Math.max(0, stats.totalStudents - stats.studentsInGroups), isWarning: (stats.totalStudents - stats.studentsInGroups) > 0 },
    { label: 'Group Rules', value: `Min ${stats.minGroupSize} · Max ${stats.maxGroupSize}` },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">Group Management</h1>
          <p className="text-text-secondary text-sm">{offeringName}</p>
        </div>
        <div className="flex items-center gap-3">
          {offeringId && (
            <CreateGroupButton offeringId={offeringId} disabled={!canCreateGroup} />
          )}
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, i) => (
          <div key={i} className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="text-text-secondary text-xs mb-2 font-medium">
              {stat.label}
            </div>
            <div className={`text-2xl font-semibold font-display ${stat.isWarning ? 'text-danger' : 'text-text-primary'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <GroupsClient 
        groups={groups} 
        isUserInGroup={!canCreateGroup}
        userGroupId={userGroupId}
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
