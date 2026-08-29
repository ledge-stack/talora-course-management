'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TimetableGrid({ events, canEdit = false, courseUnits = [] }: any) {
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
    { bg: 'rgba(232, 121, 249, 0.1)', border: 'var(--color-accent-violet)' },
    { bg: 'rgba(45, 212, 191, 0.1)', border: 'var(--color-accent-teal)' }
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

  const agendaDays = days.map((day, i) => {
    const dayEvents = events.filter((e: any) => e.dayOfWeek === i + 1).sort((a: any, b: any) => parseTime(a.startTime) - parseTime(b.startTime));
    return { day, events: dayEvents, isToday: currentDayIndex === i };
  }).filter(d => d.events.length > 0 || d.isToday);

  return (
    <div className="relative">
      {canEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Event
          </button>
        </div>
      )}

      {/* --- MOBILE VIEW (LIST) --- */}
      <div className="mobile-timetable-list" style={{ flexDirection: 'column', gap: '1.5rem' }}>
        {agendaDays.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.125rem', border: '1px solid var(--border-rule)', borderRadius: 'var(--radius-md)' }}>
            No events scheduled.
          </div>
        ) : (
          agendaDays.map(({ day, events: dayEvents, isToday }) => (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.375rem', fontWeight: 700, color: isToday ? 'var(--color-primary)' : 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {day}
                </h3>
                {isToday && <span className="stamp stamp-danger" style={{ padding: '0.125rem 0.375rem' }}>Today</span>}
                <div style={{ flex: 1, height: '1px', background: 'var(--border-rule)' }} />
              </div>
              
              {dayEvents.length === 0 ? (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No events</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dayEvents.map((event: any) => {
                    const colors = getEventColors(event.offeringId);
                    return (
                      <div key={event.id} style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: `4px solid ${colors.border}` }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, background: colors.border }} />
                        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.375rem', lineHeight: 1.2 }}>{event.title}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {event.startTime} - {event.endTime}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              {event.location}
                            </div>
                          </div>
                          {canEdit && (
                            <button 
                              onClick={() => handleDelete(event.id)}
                              style={{ background: 'none', border: 'none', padding: '0.375rem', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- DESKTOP VIEW (GRID) --- */}
      <div className="desktop-timetable-grid table-responsive-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(5, 1fr)', gap: '1px', background: 'var(--border-rule)', border: '1px solid var(--border-rule)', overflow: 'hidden', minWidth: '700px' }}>
          <div style={{ background: 'var(--color-bg-base)', padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Time</div>
          {days.map((day, i) => (
            <div key={day} style={{ background: 'var(--color-bg-base)', padding: '1rem', textAlign: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', fontWeight: 600, color: i === currentDayIndex ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
              {day}
            </div>
          ))}

          <div style={{ display: 'contents' }}>
            <div style={{ background: 'var(--color-bg-base)' }}>
              {hours.map(hour => (
                <div key={hour} style={{ height: '80px', borderTop: '1px solid var(--border-rule)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {days.map((_, dayIndex) => (
              <div key={dayIndex} style={{ background: 'var(--color-bg-surface)', position: 'relative' }}>
                {hours.map(hour => (
                  <div key={hour} style={{ height: '80px', borderTop: '1px solid var(--border-rule)' }} />
                ))}

                {/* Current Time Line */}
                {showCurrentTime && dayIndex === currentDayIndex && (
                  <div style={{ position: 'absolute', top: `${currentTimeTop}px`, left: 0, right: 0, height: '1px', background: 'var(--color-danger)', zIndex: 20 }}>
                    <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '9px', height: '9px', borderRadius: '50%', background: 'var(--color-danger)', boxShadow: '0 0 0 2px var(--color-bg-surface)' }} />
                  </div>
                )}

                {events.filter((e: any) => e.dayOfWeek === dayIndex + 1).map((event: any) => {
                  const colors = getEventColors(event.offeringId);
                  return (
                    <div 
                      key={event.id} 
                      style={{
                        ...getEventStyle(event),
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderLeft: `3px solid ${colors.border}`,
                        padding: '0.5rem 0.625rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        overflow: 'hidden',
                        zIndex: 10
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                          {event.title}
                        </div>
                        {canEdit && (
                          <button 
                            onClick={() => handleDelete(event.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete event"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
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

      {/* Add Event Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10, 10, 10, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ledger-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-bg-base)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.375rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>Add Event</h2>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Schedule a new lecture or lab session</div>
              </div>
            </div>
            
            {error && <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label">Course Unit</label>
                <select className="input-line" value={formData.offeringId} onChange={(e: any) => setFormData({...formData, offeringId: e.target.value, title: e.target.options[e.target.selectedIndex].text})} required>
                  <option value="">Select a course...</option>
                  {courseUnits.map((cu: any) => (
                    <option key={cu.id} value={cu.offeringId}>{cu.code} - {cu.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Day of Week</label>
                  <select className="input-line" value={formData.dayOfWeek} onChange={(e: any) => setFormData({...formData, dayOfWeek: Number(e.target.value)})} required>
                    {days.map((d: any, i: any) => <option key={i+1} value={i+1}>{d}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Location</label>
                  <input type="text" className="input-line" value={formData.location} onChange={(e: any) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Room 101" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Start Time</label>
                  <input type="time" className="input-line" value={formData.startTime} onChange={(e: any) => setFormData({...formData, startTime: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">End Time</label>
                  <input type="time" className="input-line" value={formData.endTime} onChange={(e: any) => setFormData({...formData, endTime: e.target.value})} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
