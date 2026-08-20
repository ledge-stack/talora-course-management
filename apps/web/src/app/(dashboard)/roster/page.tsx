import React from 'react';
import { cookies } from 'next/headers';
import { db } from '@talora/database';
import { verifyJwt } from '@talora/auth';


import RosterClient from './RosterClient';
import type { UserScope } from '@talora/auth';

const extractYY = (identifier: string | null) => {
  if (!identifier) return null;
  const match = identifier.match(/^(\d{2})/);
  return match ? parseInt(match[1]) : null;
};

export default async function RosterPage() {
  const token = cookies().get('talora_token')?.value;
  let students: any[] = [];
  let offeringName = 'No Offering Selected';
  let canEdit = false;
  let offering: any = null;

  if (token) {
    try {
      const scope = await verifyJwt(token) as UserScope;
      canEdit = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');
      
      const activeOfferingId = cookies().get('active_offering_id')?.value;
      if (activeOfferingId) {
        offering = await db.courseOffering.findUnique({
          where: { id: activeOfferingId },
          include: { unit: true, term: true, class: true },
        });
      }
      
      if (!offering) {
        const firstEnrollment = await db.enrollment.findFirst({
          where: { studentId: scope.userId },
          include: { offering: { include: { unit: true, term: true, class: true } } },
        });
        if (firstEnrollment) {
          offering = firstEnrollment.offering;
        } else {
          // If not enrolled but they are a Class Rep, find an offering for their class
          const repRole = scope.roles.find(r => r.role === 'CLASS_REPRESENTATIVE');
          if (repRole?.classId) {
            offering = await db.courseOffering.findFirst({
              where: { classId: repRole.classId },
              include: { unit: true, term: true, class: true },
            });
          }
        }
      }

      if (offering) {
        offeringName = `${offering.term.name} · ${offering.unit.code} · ${offering.class.name}`;
        
        // Find Class Representative to establish baseline YY
        const classRepRole = await db.userRole.findFirst({
          where: { role: 'CLASS_REPRESENTATIVE', classId: offering.class.id },
          include: { user: true }
        });
        
        const repYY = classRepRole ? extractYY(classRepRole.user.registrationNumber || classRepRole.user.studentNumber) : null;

        const enrollments = await db.enrollment.findMany({
          where: { offeringId: offering.id },
          include: {
            student: {
              include: {
                memberships: {
                  where: { offeringId: offering.id },
                  include: { group: true }
                }
              }
            }
          },
          orderBy: { student: { fullName: 'asc' } }
        });

        students = enrollments.map(e => {
          const studentYY = extractYY(e.student.registrationNumber || e.student.studentNumber);
          const isRetaker = (repYY && studentYY && studentYY < repYY && !e.student.tookGapYear) ? true : false;

          return {
            id: e.student.studentNumber || e.student.id,
            userId: e.student.id,
            name: e.student.fullName,
            email: e.student.email,
            group: e.student.memberships[0]?.group?.name || 'Unassigned',
            isRetaker,
            tookGapYear: e.student.tookGapYear
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100%' }}>
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>Class Roster</h1>
          <p>{offeringName} — {students.length} Students</p>
        </div>
        <div className="page-header-actions">
          {offering && (
            <a href={`/api/v1/offerings/${offering.id}/export`} className="btn-secondary" style={{ textDecoration: 'none' }} download>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Class List
            </a>
          )}
        </div>
      </header>

      {/* Main Content Card */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <RosterClient students={students} canEdit={canEdit} offeringId={offering?.id} />
      </div>
    </div>
  );
}
