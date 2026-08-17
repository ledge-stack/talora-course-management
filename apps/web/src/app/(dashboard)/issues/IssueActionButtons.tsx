'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IssueActionButtons({ issueId, currentStatus }: { issueId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update issue');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      {currentStatus === 'OPEN' && (
        <button 
          onClick={() => handleAction('TRIAGED')} 
          disabled={loading}
          className="btn-secondary" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
        >
          Mark Triaged
        </button>
      )}
      {currentStatus !== 'RESOLVED' && (
        <button 
          onClick={() => handleAction('RESOLVED')} 
          disabled={loading}
          className="btn-primary" 
          style={{ padding: '0.25rem 0.5rem', background: 'var(--color-success)', fontSize: '0.75rem' }}
        >
          Resolve
        </button>
      )}
      {currentStatus === 'RESOLVED' && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>Resolved</span>
      )}
    </div>
  );
}
