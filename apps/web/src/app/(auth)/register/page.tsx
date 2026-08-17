'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentNumber: '',
    registrationNumber: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email.endsWith('@students.mak.ac.ug')) {
      setError('You must register with a valid @students.mak.ac.ug email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      router.push('/login?registered=true');
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Student Registration</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Create your Makerere University account</p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
            <label className="label">University Email</label>
            <input 
              type="email" 
              className="input" 
              placeholder="name@students.mak.ac.ug"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
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
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
