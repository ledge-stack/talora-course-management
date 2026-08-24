import React from 'react';
import { headers, cookies } from 'next/headers';
import { db } from '@talora/database';
import TimetableGrid from './TimetableGrid';
import CourseContactsClient from './CourseContactsClient';
import PrintButton from './PrintButton';
import type { UserScope } from '@talora/auth';

export const dynamic = 'force-dynamic';

export default async function TimetablePage() {
  const scopeHeader = headers().get('x-user-scope');
  let events: any[] = [];
  let courseUnits: any[] = [];
  let offeringName = 'No Offering Selected';
  let canEdit = false;

  if (scopeHeader) {
    try {
      const scope = JSON.parse(scopeHeader) as UserScope;
      canEdit = scope.roles.some((r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

      
      let offering;
      const activeOfferingId = cookies().get('active_offering_id')?.value;
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
        offeringName = `${offering.term.name} · ${offering.class.name} Timetable`;
        
        // Fetch course units for this class
        const offeringsForClass = await db.courseOffering.findMany({
          where: { classId: offering.classId, termId: offering.termId },
          include: { unit: true }
        });
        
        courseUnits = offeringsForClass.map(o => ({
          ...o.unit,
          offeringId: o.id
        }));

        const dbEvents = await db.timetableEvent.findMany({
          where: { offeringId: { in: offeringsForClass.map(o => o.id) } }
        });
        events = dbEvents;
      }
    } catch (e: any) {
      offeringName = 'Error: ' + e.message;
      console.error(e);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Class Timetable</h1>
          <p>{offeringName}</p>
        </div>
        <div className="page-header-actions">
          <PrintButton />
        </div>
      </header>

      {/* Main Content Card */}
      <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <TimetableGrid 
          events={events} 
          canEdit={canEdit} 
          courseUnits={courseUnits} 
        />
      </div>

      <CourseContactsClient 
        courseUnits={courseUnits} 
        canEdit={canEdit} 
      />
    </div>
  );
}
