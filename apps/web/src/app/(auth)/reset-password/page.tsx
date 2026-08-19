'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailQuery = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: emailQuery,
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (emailQuery) {
      setFormData(prev => ({ ...prev, email: emailQuery }));
    }
  }, [emailQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          token: formData.code,
          newPassword: formData.newPassword
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>T</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>Talora</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Enter the 6-digit code sent to your email</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Password Reset Successful</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Email Address</label>
              <input 
                type="email" 
                className="input" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                readOnly={!!emailQuery}
                style={{ opacity: emailQuery ? 0.7 : 1 }}
              />
            </div>

            <div>
              <label className="label">6-Digit Code</label>
              <input 
                type="text" 
                className="input" 
                placeholder="123456"
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})} 
                required 
                maxLength={6}
                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.125rem', fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="label">New Password</label>
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
              <label className="label">Confirm New Password</label>
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

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.9375rem' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link href="/login" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
