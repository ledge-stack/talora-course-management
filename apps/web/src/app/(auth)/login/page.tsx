import React from 'react';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', padding: '1rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Subtle premium background glow */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '3rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--color-primary)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(59,130,246,0.3)' }}>
            T
          </div>
          <h1 style={{ color: 'var(--color-text-primary)', fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Welcome to Talora</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Sign in to coordinate classes & groups</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Institutional Email</label>
            <input 
              type="email" 
              placeholder="e.g. s12345@university.edu" 
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.875rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.875rem' }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" style={{ accentColor: 'var(--color-primary)' }} /> Remember me
            </label>
            <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 500, transition: 'color 0.2s' }}>Forgot password?</a>
          </div>

          <button type="button" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '1rem', width: '100%' }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <p>Don't have an account? <a href="#" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'underline', textDecorationColor: 'var(--border-strong)' }}>Contact your administrator</a></p>
        </div>
      </div>
    </div>
  );
}
