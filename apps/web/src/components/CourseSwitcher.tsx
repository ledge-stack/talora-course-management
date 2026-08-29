'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseSwitcher({ 
  availableOfferings, 
  activeOfferingId 
}: { 
  availableOfferings: any[], 
  activeOfferingId: string | null 
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // If no offering is active (or if it's stale/invalid), set the first available one as active
  useEffect(() => {
    const isStale = activeOfferingId && !availableOfferings.some(o => o.id === activeOfferingId);
    if ((!activeOfferingId || isStale) && availableOfferings.length > 0) {
      handleChange(availableOfferings[0].id);
    }
  }, [activeOfferingId, availableOfferings]);

  const handleChange = async (newOfferingId: string) => {
    if (newOfferingId === activeOfferingId) return;
    
    setIsUpdating(true);
    try {
      await fetch('/api/v1/active-offering', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offeringId: newOfferingId }),
      });
      router.refresh();
    } catch (e) {
      console.error('Failed to switch course', e);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!availableOfferings || availableOfferings.length === 0) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div 
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 0.5rem',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          transition: 'opacity 0.2s',
          opacity: isUpdating ? 0.7 : 1,
          pointerEvents: isUpdating ? 'none' : 'auto',
          position: 'relative'
        }}
      >
        <select 
          value={activeOfferingId || availableOfferings[0]?.id || ''}
          onChange={(e) => handleChange(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
            paddingRight: '1rem',
            maxWidth: '120px',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {availableOfferings.map(o => (
            <option key={o.id} value={o.id} style={{ color: 'var(--color-text-primary)' }}>
              {o.unit?.title} · {o.class?.name}
            </option>
          ))}
        </select>
        <div style={{ position: 'absolute', right: '0.375rem', pointerEvents: 'none', display: 'flex', color: 'var(--color-text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </div>
  );
}
