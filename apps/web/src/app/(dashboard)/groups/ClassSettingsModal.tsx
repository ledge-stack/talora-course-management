'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClassSettingsModal({ 
  offeringId, 
  currentMin, 
  currentMax, 
  onClose 
}: { 
  offeringId: string, 
  currentMin: number, 
  currentMax: number, 
  onClose: () => void 
}) {
  const router = useRouter();
  const [minGroupSize, setMinGroupSize] = useState(currentMin);
  const [maxGroupSize, setMaxGroupSize] = useState(currentMax);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minGroupSize > maxGroupSize) {
      setError('Minimum group size cannot be greater than maximum group size.');
      return;
    }
    if (minGroupSize < 1) {
      setError('Minimum group size must be at least 1.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/offerings/${offeringId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minGroupSize, maxGroupSize })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update class settings');
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
      <div className="glass-panel" style={{ width: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Group size rules</h2>
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
            <label className="label">Minimum group size</label>
            <input 
              type="number" 
              className="input" 
              value={minGroupSize} 
              onChange={(e) => setMinGroupSize(parseInt(e.target.value) || 1)}
              min={1}
              required 
            />
          </div>

          <div>
            <label className="label">Maximum group size</label>
            <input 
              type="number" 
              className="input" 
              value={maxGroupSize} 
              onChange={(e) => setMaxGroupSize(parseInt(e.target.value) || 1)}
              min={1}
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save rules'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
