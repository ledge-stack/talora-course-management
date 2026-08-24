'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NotificationActionButtons({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });

      if (!res.ok) {
        throw new Error('Failed to mark as read');
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleMarkAsRead} 
      disabled={loading}
      className="btn-ghost" 
      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-primary)' }}
    >
      Mark Read
    </button>
  );
}
