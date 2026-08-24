'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export default function DeleteAccountButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete account');
      }
      
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      toast.error('Could not delete account. Please try again.');
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      disabled={loading}
      className="btn-secondary" 
      style={{ 
        color: 'white', 
        backgroundColor: 'var(--color-danger)', 
        borderColor: 'var(--color-danger-bg)' 
      }}
    >
      {loading ? 'Deleting...' : confirming ? 'Are you sure?' : 'Delete Account'}
    </button>
  );
}
