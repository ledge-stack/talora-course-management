'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RequestActionButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/group-change-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to process request');
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      <button 
        onClick={() => handleAction('REJECTED')} 
        disabled={loading}
        className="btn-ghost" 
        style={{ padding: '0.25rem 0.5rem', color: 'var(--color-danger)', fontSize: '0.8125rem' }}
      >
        Reject
      </button>
      <button 
        onClick={() => handleAction('APPROVED')} 
        disabled={loading}
        className="btn-primary" 
        style={{ padding: '0.25rem 0.5rem', background: 'var(--color-success)', fontSize: '0.8125rem' }}
      >
        Approve
      </button>
    </div>
  );
}
