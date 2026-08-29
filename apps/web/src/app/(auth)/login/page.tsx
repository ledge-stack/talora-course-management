'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification) {
          window.location.href = `/verify?email=${encodeURIComponent(email)}`;
          return;
        }
        throw new Error(data.message || 'Login failed');
      }
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── shared input style ─── */
  const lineInput: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid var(--border-strong)',
    color: 'var(--color-text-primary)',
    padding: '0.5rem 0',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', fontFamily: 'var(--font-sans)' }}>

      {/* ── Left — Editorial Poster ── */}
      <div className="auth-poster" style={{
        flex: '0 0 45%',
        background: '#080809',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Huge ambient glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 60%, rgba(255,75,51,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Horizontal rule lines — like ledger paper */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 0, right: 0,
            top: `${(i + 1) * 5.5}%`,
            height: '1px',
            background: 'rgba(244, 242, 237, 0.04)',
          }} />
        ))}

        {/* The wordmark — fills the space */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 800,
            fontSize: 'clamp(5rem, 14vw, 10rem)',
            color: 'var(--color-text-primary)',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
          }}>
            Talora
          </div>

          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
          }}>
            <div style={{ height: '1px', width: '40px', background: 'var(--border-strong)' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}>
              Class & Group Coordination
            </span>
            <div style={{ height: '1px', width: '40px', background: 'var(--border-strong)' }} />
          </div>

          {/* Orange stamp dot */}
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            margin: '2rem auto 0',
            boxShadow: '0 0 24px rgba(255,75,51,0.6)',
          }} />
        </div>
      </div>

      {/* ── Right — Sign-in form ── */}
      <div style={{
        flex: 1,
        background: 'var(--color-bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              marginBottom: '0.75rem',
            }}>
              Sign in
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1.875rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
              margin: 0,
            }}>
              Welcome back.
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              borderLeft: '3px solid var(--color-danger)',
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={lineInput}
                onFocus={e  => (e.target.style.borderBottomColor = 'var(--color-primary)')}
                onBlur={e   => (e.target.style.borderBottomColor = 'var(--border-strong)')}
                required
              />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...lineInput, paddingRight: '2rem' }}
                  onFocus={e  => (e.target.style.borderBottomColor = 'var(--color-primary)')}
                  onBlur={e   => (e.target.style.borderBottomColor = 'var(--border-strong)')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', padding: 0, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  style={{ accentColor: 'var(--color-primary)', width: '14px', height: '14px' }}
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link href="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', marginTop: '0.5rem', letterSpacing: '-0.01em' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-rule)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              Sign up
            </Link>
            {' '}or contact your administrator.
          </div>
        </div>
      </div>
    </div>
  );
}
