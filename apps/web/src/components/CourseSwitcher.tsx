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
  
  // If no offering is active but we have available offerings, set the first one as active automatically
  useEffect(() => {
    if (!activeOfferingId && availableOfferings.length > 0) {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
      <div style={{
        padding: '0.4rem 0.75rem',
        background: 'var(--color-bg-surface-hover)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: isUpdating ? 0.7 : 1,
        pointerEvents: isUpdating ? 'none' : 'auto'
      }}>
        <select 
          value={activeOfferingId || availableOfferings[0]?.id || ''}
          onChange={(e) => handleChange(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            paddingRight: '1rem'
          }}
        >
          {availableOfferings.map(o => (
            <option key={o.id} value={o.id} style={{ color: '#000' }}>
              {o.unit?.title} · {o.class?.name}
            </option>
          ))}
        </select>
        <div style={{ position: 'absolute', right: '0.75rem', pointerEvents: 'none', display: 'flex' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </div>
  );
}
