'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    studentNumber: user.studentNumber || '',
    registrationNumber: user.registrationNumber || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update profile');
      }

      if (data.emailChanged) {
        // If email changed, they've been logged out. Redirect to login.
        router.push('/login');
        return;
      }

      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
        <button 
          onClick={() => setIsEditing(true)} 
          className="btn-ghost" 
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.4rem' }}
          title="Edit Profile"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Personal Details</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Full Name</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{user.fullName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Email Address</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Student Number</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{user.studentNumber || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Registration Number</div>
            <div style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{user.registrationNumber || 'N/A'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Edit Profile</h2>
      
      {error && (
        <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Full Name</label>
          <input 
            type="text" 
            className="input" 
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Email Address</label>
          <input 
            type="email" 
            className="input" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Student Number</label>
          <input 
            type="text" 
            className="input" 
            value={formData.studentNumber}
            disabled
            style={{ backgroundColor: 'var(--color-bg-surface-hover)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Registration Number</label>
          <input 
            type="text" 
            className="input" 
            value={formData.registrationNumber}
            disabled
            style={{ backgroundColor: 'var(--color-bg-surface-hover)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
