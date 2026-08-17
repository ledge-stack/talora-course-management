'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function GapYearToggle({ userId, isGapYear, canEdit }: { userId: string, isGapYear: boolean, canEdit: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleGapYear = async () => {
    if (!canEdit) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${userId}/gap-year`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tookGapYear: !isGapYear })
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error('Failed to toggle gap year');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) return null;

  return (
    <button 
      onClick={toggleGapYear}
      disabled={loading}
      className="btn-ghost" 
      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: isGapYear ? 'var(--color-text-primary)' : 'var(--color-text-muted)', border: '1px solid var(--border-subtle)' }}
      title={isGapYear ? "Remove Gap Year status" : "Mark as Non-Retaker (Gap Year)"}
    >
      {loading ? '...' : isGapYear ? 'Remove Gap Year' : 'Mark Gap Year'}
    </button>
  );
}
