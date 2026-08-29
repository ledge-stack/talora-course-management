import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import RequestActionButtons from './RequestActionButtons';

export default async function GroupRequestsPage() {
  const scopeHeader = headers().get('x-user-scope');
  if (!scopeHeader) redirect('/login');

  let requests: any[] = [];
  let offeringName = 'No Offering Selected';

  try {
    const payload = JSON.parse(scopeHeader);
    const isRep = payload.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE');
    if (!isRep) {
      // Only class reps can view all requests and process them
      redirect('/');
    }
    
    const offering = await db.courseOffering.findFirst({
      include: { unit: true, term: true, class: true },
    });

    if (offering) {
      offeringName = `${offering.term.name} · ${offering.unit.title} · ${offering.class.name}`;
      
      const dbReqs = await db.groupChangeRequest.findMany({
        where: { group: { offeringId: offering.id } },
        include: {
          group: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const targetGroupIds = dbReqs.map(r => r.targetGroupId).filter(Boolean) as string[];
      const targetGroups = await db.group.findMany({ where: { id: { in: targetGroupIds } }, select: { id: true, name: true } });
      const targetGroupMap = new Map(targetGroups.map(g => [g.id, g.name]));

      const studentIds = dbReqs.map(r => r.studentId);
      const students = await db.user.findMany({ where: { id: { in: studentIds } }, select: { id: true, fullName: true, studentNumber: true } });
      const studentMap = new Map(students.map(s => [s.id, s]));

      requests = dbReqs.map(r => ({
        id: r.id,
        studentName: studentMap.get(r.studentId)?.fullName || 'Unknown',
        studentNumber: studentMap.get(r.studentId)?.studentNumber || '',
        fromGroupName: r.group.name,
        targetGroupName: r.targetGroupId ? targetGroupMap.get(r.targetGroupId) : 'Leave group (unassigned)',
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt
      }));
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Group change requests</h1>
          <p>{offeringName} — pending and history</p>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Table */}
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Student</th>
                <th style={{ width: '15%' }}>Current group</th>
                <th style={{ width: '15%' }}>Requested target</th>
                <th style={{ width: '25%' }}>Reason</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No group change requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ color: 'var(--color-text-primary)' }}>
                      <div className="font-medium">{req.studentName}</div>
                      <div className="reg-number">{req.studentNumber}</div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{req.fromGroupName}</td>
                    <td style={{ color: 'var(--color-text-primary)' }}>{req.targetGroupName}</td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>{req.reason}</td>
                    <td>
                      <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {req.status === 'PENDING' ? (
                        <RequestActionButtons requestId={req.id} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
