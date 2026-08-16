'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Force a hard refresh to re-evaluate middleware and layouts with the new cookie
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', padding: '1rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Subtle premium background glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', animation: 'pulse-glow 6s ease-in-out infinite' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', animation: 'pulse-glow 6s ease-in-out infinite 3s' }}></div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '3rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--color-primary)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(59,130,246,0.3)' }}>
            T
          </div>
          <h1 style={{ color: 'var(--color-text-primary)', fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Welcome to Talora</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Sign in to coordinate classes & groups</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1.5rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Institutional Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. rep@university.edu" 
              className="input"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} /> Remember me
            </label>
            <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 500, transition: 'color 0.2s' }}>Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '1rem', width: '100%' }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <p>Don't have an account? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign up</Link> or <a href="#" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'underline', textDecorationColor: 'var(--border-strong)' }}>Contact your administrator</a></p>
        </div>
      </div>
    </div>
  );
}
