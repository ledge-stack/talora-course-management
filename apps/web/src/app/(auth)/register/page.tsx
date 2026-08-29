'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentNumber: '',
    registrationNumber: '',
    password: '',
    phoneNumber: ''
  });
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // If a verifier from a previous mount is left on the window, clear it out.
    // This prevents the "reCAPTCHA client element has been removed" error
    // when navigating away and coming back.
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
      (window as any).recaptchaVerifier = undefined;
    }

    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });

    // Cleanup on unmount
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = undefined;
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber) {
      setError('Please provide a valid phone number.');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the Terms and Conditions to continue.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formData.phoneNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !confirmationResult) return;

    setLoading(true);
    setError('');

    try {
      // 1. Verify Phone Token
      const result = await confirmationResult.confirm(otpCode);
      const firebaseIdToken = await result.user.getIdToken();

      // 2. Register User
      const payload = {
        ...formData,
        acceptedTerms,
        firebaseIdToken
      };

      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Navigate to login
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const lineInput: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid var(--border-strong)',
    color: 'var(--color-text-primary)',
    padding: '0.5rem 0',
    fontSize: '0.9375rem',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.2s',
  };

  const mono6: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-muted)',
    display: 'block',
    marginBottom: '0.5rem',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999 }} />

      {/* ── Left — Editorial Poster ── */}
      <div className="auth-poster" style={{
        flex: '0 0 40%',
        background: '#080809',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 60% 40%, rgba(255,75,51,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 5.5}%`, height: '1px', background: 'rgba(244,242,237,0.04)' }} />
        ))}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 800, fontSize: 'clamp(4rem, 12vw, 8rem)', color: 'var(--color-text-primary)', lineHeight: 0.9, letterSpacing: '-0.04em' }}>
            Talora
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ height: '1px', width: '32px', background: 'var(--border-strong)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Student Registration
            </span>
            <div style={{ height: '1px', width: '32px', background: 'var(--border-strong)' }} />
          </div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)', margin: '2rem auto 0', boxShadow: '0 0 20px rgba(255,75,51,0.5)' }} />
        </div>
      </div>

      {/* ── Right — Registration form ── */}
      <div style={{
        flex: 1,
        background: 'var(--color-bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 2rem',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
              {otpSent ? 'Verify your number' : 'Create account'}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', lineHeight: 1.1, margin: 0 }}>
              {otpSent ? 'Check your phone.' : 'Join the register.'}
            </h1>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '6px', fontSize: '0.875rem', borderLeft: '3px solid var(--color-danger)' }}>
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <label style={mono6}>Full name</label>
                <input type="text" style={lineInput} placeholder="e.g. Nakato Amina" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} onFocus={e => (e.target.style.borderBottomColor = 'var(--color-primary)')} onBlur={e => (e.target.style.borderBottomColor = 'var(--border-strong)')} required />
              </div>
              <div>
                <label style={mono6}>Email address</label>
                <input type="email" style={lineInput} placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} onFocus={e => (e.target.style.borderBottomColor = 'var(--color-primary)')} onBlur={e => (e.target.style.borderBottomColor = 'var(--border-strong)')} required />
              </div>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={mono6}>Student number</label>
                  <input type="text" style={lineInput} placeholder="21007…" value={formData.studentNumber} onChange={e => setFormData({...formData, studentNumber: e.target.value})} onFocus={e => (e.target.style.borderBottomColor = 'var(--color-primary)')} onBlur={e => (e.target.style.borderBottomColor = 'var(--border-strong)')} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={mono6}>Reg. number</label>
                  <input type="text" style={lineInput} placeholder="21/U/…" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} onFocus={e => (e.target.style.borderBottomColor = 'var(--color-primary)')} onBlur={e => (e.target.style.borderBottomColor = 'var(--border-strong)')} required />
                </div>
              </div>
              <div>
                <label style={mono6}>Phone number</label>
                <PhoneInput
                  international
                  defaultCountry="UG"
                  className="input phone-input"
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData({...formData, phoneNumber: value || ''})}
                  style={{ '--PhoneInputCountryFlag-height': '14px', '--PhoneInput-color--focus': 'var(--color-primary)' } as any}
                />
              </div>
              <div>
                <label style={mono6}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} style={{ ...lineInput, paddingRight: '2rem' }} placeholder="Create a strong password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} onFocus={e => (e.target.style.borderBottomColor = 'var(--color-primary)')} onBlur={e => (e.target.style.borderBottomColor = 'var(--border-strong)')} required minLength={8} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', padding: 0, cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>

              <label htmlFor="accept-terms" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '0.875rem', borderRadius: '8px', background: acceptedTerms ? 'var(--color-primary-transparent)' : 'rgba(255,255,255,0.02)', border: `1.5px solid ${acceptedTerms ? 'var(--color-primary)' : 'var(--border-subtle)'}`, transition: 'all 0.2s ease' }}>
                <input id="accept-terms" type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                <div style={{ flexShrink: 0, width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${acceptedTerms ? 'var(--color-primary)' : 'var(--border-strong)'}`, background: acceptedTerms ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', marginTop: '1px' }}>
                  {acceptedTerms && <svg width="10" height="10" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5 9.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, userSelect: 'none' }}>
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Terms and Conditions</Link>
                  {' '}for data usage on this platform.
                </span>
              </label>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', opacity: (!acceptedTerms || loading) ? 0.5 : 1, cursor: (!acceptedTerms || loading) ? 'not-allowed' : 'pointer' }} disabled={loading || !acceptedTerms}>
                {loading ? 'Sending code…' : 'Continue →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <label style={{ ...mono6, marginBottom: '0.75rem' }}>
                  6-digit code sent to {formData.phoneNumber}
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  placeholder="· · · · · ·"
                  required
                  style={{
                    ...lineInput,
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.35em',
                    fontFamily: 'var(--font-mono)',
                  }}
                  onFocus={e => (e.target.style.borderBottomColor = 'var(--color-primary)')}
                  onBlur={e  => (e.target.style.borderBottomColor = 'var(--border-strong)')}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem' }} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & create account →'}
              </button>
              <button type="button" onClick={() => setOtpSent(false)} className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                ← Back
              </button>
            </form>
          )}

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-rule)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

