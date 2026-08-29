'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export default function PhoneOnboardingModal({ userId }: { userId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    if (!phoneNumber) {
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
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
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
      const result = await confirmationResult.confirm(otpCode);
      const firebaseIdToken = await result.user.getIdToken();

      const res = await fetch(`/api/v1/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, acceptedTerms, firebaseIdToken }) 
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to update profile');
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-content" style={{ background: 'var(--color-bg-surface)', padding: '2rem', borderRadius: '16px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
      <div id="recaptcha-container"></div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Action Required</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontSize: '0.9375rem' }}>{otpSent ? 'Enter the verification code sent to your phone.' : 'Please complete your profile to continue using the dashboard.'}</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Phone Number</label>
              <PhoneInput
                international
                defaultCountry="UG"
                className="input phone-input"
                value={phoneNumber}
                onChange={(value) => setPhoneNumber(value || '')}
                style={{ 
                  '--PhoneInputCountryFlag-height': '16px',
                  '--PhoneInput-color--focus': 'var(--color-primary)'
                } as any}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <input 
                type="checkbox" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '0.25rem', width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Terms and Conditions</a> regarding data usage for academic coordination on this platform.
              </span>
            </label>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Verification Code</label>
              <input
                type="text"
                className="input"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify and Save'}
            </button>
            <button type="button" onClick={() => setOtpSent(false)} className="btn-secondary" style={{ width: '100%' }} disabled={loading}>
              Back
            </button>
          </form>
        )}
      </div>
  );
}
