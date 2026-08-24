'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';

export default function EditContactModal({ 
  unit, 
  onClose 
}: { 
  unit: any, 
  onClose: () => void 
}) {
  const router = useRouter();
  const [title, setTitle] = useState(unit.title || '');
  const [lecturerName, setLecturerName] = useState(unit.lecturerName || '');
  const [lecturerEmail, setLecturerEmail] = useState(unit.lecturerEmail || '');
  const [lecturerPhone, setLecturerPhone] = useState(unit.lecturerPhone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/course-units/${unit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          lecturerName, 
          lecturerEmail, 
          lecturerPhone 
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update course contact');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border-subtle bg-bg-surface p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <Dialog.Title className="text-xl font-display font-semibold text-text-primary">Edit Course Information</Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn-ghost p-1.5 text-text-muted hover:text-text-primary rounded-full">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </Dialog.Close>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm border border-danger/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div>
              <label className="label">Course Title</label>
              <input 
                type="text" 
                className="input w-full" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="label">Lecturer Name (Optional)</label>
              <input 
                type="text" 
                className="input w-full" 
                value={lecturerName} 
                onChange={(e) => setLecturerName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="label">Lecturer Email (Optional)</label>
              <input 
                type="email" 
                className="input w-full" 
                value={lecturerEmail} 
                onChange={(e) => setLecturerEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Lecturer Phone (Optional)</label>
              <input 
                type="text" 
                className="input w-full" 
                value={lecturerPhone} 
                onChange={(e) => setLecturerPhone(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Dialog.Close asChild>
                <button type="button" className="btn-secondary" disabled={loading}>Cancel</button>
              </Dialog.Close>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
