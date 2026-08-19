'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Forgot Password</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Enter your email to receive a reset code</p>
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
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Check your email</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>We've sent a 6-digit reset code to {email}. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Institutional Email</label>
              <input 
                type="email" 
                className="input" 
                placeholder="name@students.mak.ac.ug"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.9375rem' }}
              disabled={loading}
            >
              {loading ? 'Sending Code...' : 'Send Reset Code'}
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
