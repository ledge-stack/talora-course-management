'use client';

import React, { useState } from 'react';
import EditContactModal from './EditContactModal';

export default function CourseContactsClient({ courseUnits, canEdit }: { courseUnits: any[], canEdit: boolean }) {
  const [editingUnit, setEditingUnit] = useState<any | null>(null);

  return (
    <>
      <section className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Course Contacts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {courseUnits.map(unit => (
            <div key={unit.id} style={{ position: 'relative', padding: '1rem', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem', paddingRight: '2rem' }}>
                  {unit.code} — {unit.title}
                </div>
                {canEdit && (
                  <button 
                    onClick={() => setEditingUnit(unit)}
                    className="btn-ghost" 
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.4rem', color: 'var(--color-text-muted)' }}
                    title="Edit Contact Info"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                )}
              </div>
              
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

      {editingUnit && (
        <EditContactModal 
          unit={editingUnit} 
          onClose={() => setEditingUnit(null)} 
        />
      )}
    </>
  );
}
