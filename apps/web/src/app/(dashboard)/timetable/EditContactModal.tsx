'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditContactModal({ 
  unit, 
  onClose 
}: { 
  unit: any, 
  onClose: () => void 
}) {
  const router = useRouter();
  const [title, setTitle] = useState(unit.title || '');
  const [lecturerName, setLecturerName] = useState(unit.lecturerName || '');
  const [lecturerEmail, setLecturerEmail] = useState(unit.lecturerEmail || '');
  const [lecturerPhone, setLecturerPhone] = useState(unit.lecturerPhone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/course-units/${unit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          lecturerName, 
          lecturerEmail, 
          lecturerPhone 
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update course contact');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '450px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Edit Course Information</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label className="label">Course Title</label>
            <input 
              type="text" 
              className="input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>

          <div>
            <label className="label">Lecturer Name (Optional)</label>
            <input 
              type="text" 
              className="input" 
              value={lecturerName} 
              onChange={(e) => setLecturerName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="label">Lecturer Email (Optional)</label>
            <input 
              type="email" 
              className="input" 
              value={lecturerEmail} 
              onChange={(e) => setLecturerEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Lecturer Phone (Optional)</label>
            <input 
              type="text" 
              className="input" 
              value={lecturerPhone} 
              onChange={(e) => setLecturerPhone(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
