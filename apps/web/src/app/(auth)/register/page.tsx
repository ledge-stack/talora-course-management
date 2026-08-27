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
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div id="recaptcha-container"></div>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.25rem' }}>T</div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>Talora</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Student Registration</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{otpSent ? 'Enter verification code' : 'Create your Makerere University account'}</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Full Name</label>
              <input 
                type="text" 
                className="input" 
                placeholder="e.g. John Doe"
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input 
                type="email" 
                className="input" 
                placeholder="name@example.com"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div className="flex-row-mobile-stack" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">Student Number</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. 21007..."
                  value={formData.studentNumber} 
                  onChange={e => setFormData({...formData, studentNumber: e.target.value})} 
                  required 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Registration No.</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. 21/U/..."
                  value={formData.registrationNumber} 
                  onChange={e => setFormData({...formData, registrationNumber: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <PhoneInput
                international
                defaultCountry="UG"
                className="input phone-input"
                value={formData.phoneNumber}
                onChange={(value) => setFormData({...formData, phoneNumber: value || ''})}
                style={{ 
                  '--PhoneInputCountryFlag-height': '16px',
                  '--PhoneInput-color--focus': 'var(--color-primary)'
                } as any}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  className="input" 
                  placeholder="Create a strong password"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
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

            <label
              htmlFor="accept-terms"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
                padding: '1rem',
                borderRadius: '10px',
                background: acceptedTerms ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                border: acceptedTerms ? '1.5px solid var(--color-primary)' : '1.5px solid var(--border-subtle)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Hidden native checkbox for form semantics */}
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              {/* Custom visible checkbox */}
              <div style={{
                flexShrink: 0,
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                border: acceptedTerms ? '2px solid var(--color-primary)' : '2px solid var(--border-strong)',
                background: acceptedTerms ? 'var(--color-primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                marginTop: '1px',
              }}>
                {acceptedTerms && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5 9.5L11 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, userSelect: 'none' }}>
                I have read and agree to the{' '}
                <Link href="/terms" target="_blank" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 500 }}>
                  Terms and Conditions
                </Link>
                {' '}regarding data usage for academic coordination on this platform.
              </span>
            </label>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                justifyContent: 'center',
                opacity: (!acceptedTerms || loading) ? 0.5 : 1,
                cursor: (!acceptedTerms || loading) ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s ease',
              }}
              disabled={loading || !acceptedTerms}
              title={!acceptedTerms ? 'You must accept the Terms and Conditions first' : ''}
            >
              {loading ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label" style={{ textAlign: 'center', display: 'block' }}>Enter the 6-digit code sent to {formData.phoneNumber}</label>
              <input
                type="text"
                className="input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                style={{ width: '100%', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.25em' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <button type="button" onClick={() => setOtpSent(false)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              Back
            </button>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
