'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateGroupModal({ offeringId, onClose }: { offeringId: string, onClose: () => void }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/offerings/${offeringId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create group');
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
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="modal-title">Start a new group</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem', margin: '0 1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            This opens an empty roll call for others to claim a slot in.
            <br />
            <br />
            Your group gets the next available numerical name (for example, Group 1) — you can rename it once it's formed.
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
