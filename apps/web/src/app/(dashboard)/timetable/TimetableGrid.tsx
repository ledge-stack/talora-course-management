'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TimetableGrid({ events, canEdit, courseUnits }: { events: any[], canEdit: boolean, courseUnits: any[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    offeringId: courseUnits[0]?.offeringId || '', 
    title: '',
    location: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '10:00'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = Array.from({ length: 10 }, (_, i) => i + 8);

  // Parse time "HH:MM"
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m / 60);
  };

  const courseColors = [
    { bg: 'var(--color-primary-transparent)', border: 'var(--color-primary)' },
    { bg: 'var(--color-success-bg)', border: 'var(--color-success)' },
    { bg: 'var(--color-warning-bg)', border: 'var(--color-warning)' },
    { bg: 'var(--color-danger-bg)', border: 'var(--color-danger)' },
    { bg: 'var(--color-info-bg)', border: 'var(--color-info)' }
  ];

  const getEventColors = (offeringId: string) => {
    let hash = 0;
    for (let i = 0; i < offeringId.length; i++) {
      hash = offeringId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return courseColors[Math.abs(hash) % courseColors.length];
  };

  const getEventStyle = (event: any) => {
    const startHour = parseTime(event.startTime);
    const endHour = parseTime(event.endTime);
    const duration = endHour - startHour;
    const topOffset = (startHour - 8) * 80;
    const height = duration * 80;
    
    return {
      position: 'absolute' as const,
      top: `${topOffset}px`,
      height: `${height}px`,
      left: '4px',
      right: '4px',
    };
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetch(`/api/v1/timetable-events/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/timetable-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create event');
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current time line position
  const now = new Date();
  const currentDayIndex = now.getDay() - 1; // 0 = Monday
  const currentHourFloat = now.getHours() + now.getMinutes() / 60;
  const showCurrentTime = currentDayIndex >= 0 && currentDayIndex < 5 && currentHourFloat >= 8 && currentHourFloat <= 18;
  const currentTimeTop = (currentHourFloat - 8) * 80;

  return (
    <div style={{ position: 'relative' }}>
      {canEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Event
          </button>
        </div>
      )}

      <div className="table-responsive-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: '1px', background: 'var(--border-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', minWidth: '700px' }}>
          <div style={{ background: 'var(--color-bg-surface)', padding: '1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>Time</div>
          {days.map((day, i) => (
            <div key={day} style={{ background: 'var(--color-bg-surface)', padding: '1rem', textAlign: 'center', fontWeight: 600, color: i === currentDayIndex ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
              {day}
            </div>
          ))}

          <div style={{ display: 'contents' }}>
            <div style={{ background: 'var(--color-bg-surface)' }}>
              {hours.map(hour => (
                <div key={hour} style={{ height: '80px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {days.map((_, dayIndex) => (
              <div key={dayIndex} style={{ background: 'var(--color-bg-base)', position: 'relative' }}>
                {hours.map(hour => (
                  <div key={hour} style={{ height: '80px', borderTop: '1px solid var(--border-subtle)' }} />
                ))}

                {/* Current Time Line */}
                {showCurrentTime && dayIndex === currentDayIndex && (
                  <div style={{ position: 'absolute', top: `${currentTimeTop}px`, left: 0, right: 0, height: '2px', background: 'var(--color-danger)', zIndex: 20 }}>
                    <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-danger)' }} />
                  </div>
                )}

                {events.filter(e => e.dayOfWeek === dayIndex + 1).map((event) => {
                  const colors = getEventColors(event.offeringId);
                  return (
                    <div 
                      key={event.id} 
                      style={{
                        ...getEventStyle(event),
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderLeft: `4px solid ${colors.border}`,
                        borderRadius: '6px',
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        overflow: 'hidden',
                        zIndex: 10
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                          {event.title}
                        </div>
                        {canEdit && (
                          <button 
                            onClick={() => handleDelete(event.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 0, opacity: 0.8 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {event.location}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Add Timetable Event</h2>
            
            {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</div>}

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Course Unit</label>
                <select className="input" value={formData.offeringId} onChange={e => setFormData({...formData, offeringId: e.target.value, title: e.target.options[e.target.selectedIndex].text})} required>
                  <option value="">Select a course...</option>
                  {courseUnits.map(cu => (
                    <option key={cu.id} value={cu.offeringId}>{cu.code} - {cu.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Day of Week</label>
                  <select className="input" value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: Number(e.target.value)})} required>
                    {days.map((d, i) => <option key={i+1} value={i+1}>{d}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Location</label>
                  <input type="text" className="input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Room 101" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Start Time</label>
                  <input type="time" className="input" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">End Time</label>
                  <input type="time" className="input" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
