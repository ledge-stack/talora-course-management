'use client';

import React, { useState } from 'react';

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password updated successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ledger-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div className="eyebrow" style={{ marginBottom: '1.25rem' }}>Change password</div>
      
      {error && (
        <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '0.75rem', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            Current password
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"}
              className="input" 
              value={formData.currentPassword}
              onChange={e => setFormData({...formData, currentPassword: e.target.value})}
              style={{ width: '100%', paddingRight: '2.5rem' }}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            New password
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"}
              className="input" 
              value={formData.newPassword}
              onChange={e => setFormData({...formData, newPassword: e.target.value})}
              required
              minLength={8}
              style={{ width: '100%', paddingRight: '2.5rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            Confirm new password
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"}
              className="input" 
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
              required
              minLength={8}
              style={{ width: '100%', paddingRight: '2.5rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
}
