'use client';

import React from 'react';

export default function ViewAssignmentButton({ id }: { id: string }) {
  return (
    <button 
      className="btn-secondary" 
      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
      onClick={() => alert(`Assignment view (ID: ${id}) is not yet implemented.`)}
    >
      View
    </button>
  );
}
