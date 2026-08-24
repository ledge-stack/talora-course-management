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
    <div className="relative flex items-center gap-3">
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 bg-bg-surface-hover rounded-md transition-opacity ${isUpdating ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}
      >
        <select 
          value={activeOfferingId || availableOfferings[0]?.id || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-transparent border-none text-text-primary text-sm font-semibold outline-none cursor-pointer appearance-none pr-4"
        >
          {availableOfferings.map(o => (
            <option key={o.id} value={o.id} className="text-black">
              {o.unit?.title} · {o.class?.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 pointer-events-none flex text-text-secondary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
    </div>
  );
}
