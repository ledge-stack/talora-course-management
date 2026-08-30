'use client';

import React, { useState } from 'react';
import EditContactModal from './EditContactModal';

export default function CourseContactsClient({ courseUnits, canEdit }: { courseUnits: any[], canEdit: boolean }) {
  const [editingUnit, setEditingUnit] = useState<any | null>(null);

  return (
    <>
      <section style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>
            Course Contacts
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-rule)' }} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {courseUnits.map(unit => (
            <div key={unit.id} className="ledger-panel" style={{ position: 'relative', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ paddingRight: '2rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                    {unit.code}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                    {unit.title}
                  </div>
                </div>
                {canEdit && (
                  <button 
                    onClick={() => setEditingUnit(unit)}
                    className="btn-ghost" 
                    style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem', color: 'var(--color-text-muted)' }}
                    title="Edit Contact Info"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
                {unit.lecturerName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{unit.lecturerName}</div>
                    {unit.lecturerEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        {unit.lecturerEmail}
                      </div>
                    )}
                    {unit.lecturerPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {unit.lecturerPhone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No lecturer assigned.
                  </div>
                )}
              </div>
            </div>
          ))}
          {courseUnits.length === 0 && (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>No courses found.</div>
          )}
        </div>
      </section>

      {editingUnit && (
        <EditContactModal 
          unit={editingUnit} 
          onClose={() => setEditingUnit(null)} 
        />
      )}
    </>
  );
}
