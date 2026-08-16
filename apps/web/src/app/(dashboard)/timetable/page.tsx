import React from 'react';
import { headers } from 'next/headers';
import { db } from '@talora/database';
import TimetableGrid from './TimetableGrid';
import type { UserScope } from '@talora/auth';

export default async function TimetablePage() {
  const scopeHeader = headers().get('x-user-scope');
  let events: any[] = [];
  let courseUnits: any[] = [];
  let offeringName = 'No Offering Selected';
  let canEdit = false;

  if (scopeHeader) {
    try {
      const scope = JSON.parse(scopeHeader) as UserScope;
      canEdit = scope.roles.some(r => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN');

      
      // Fetch the user's class (or default if they are just a student)
      const offering = await db.courseOffering.findFirst({
        include: { unit: true, term: true, class: true },
      });

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
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="page-header">
        <div>
          <h1>Class Timetable</h1>
          <p>{offeringName}</p>
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

      {/* Course Contacts Section */}
      <section className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Course Contacts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {courseUnits.map(unit => (
            <div key={unit.id} style={{ padding: '1rem', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>{unit.code} — {unit.title}</div>
              {unit.lecturerName ? (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem' }}>
                  <div style={{ color: 'var(--color-text-primary)' }}><strong>{unit.lecturerName}</strong></div>
                  {unit.lecturerEmail && <div>✉️ {unit.lecturerEmail}</div>}
                  {unit.lecturerPhone && <div>📞 {unit.lecturerPhone}</div>}
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>No lecturer assigned.</div>
              )}
            </div>
          ))}
          {courseUnits.length === 0 && (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No courses found.</div>
          )}
        </div>
      </section>
    </div>
  );
}
