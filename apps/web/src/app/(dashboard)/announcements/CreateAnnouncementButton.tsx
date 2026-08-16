'use client';

import React, { useState } from 'react';
import CreateAnnouncementModal from './CreateAnnouncementModal';

export default function CreateAnnouncementButton({ offeringId, disabled }: { offeringId: string, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="btn-primary" 
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
        New Announcement
      </button>

      {isOpen && (
        <CreateAnnouncementModal 
          offeringId={offeringId} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
