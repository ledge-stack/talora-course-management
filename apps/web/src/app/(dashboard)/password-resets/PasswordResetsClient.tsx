'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type ResetRequest = {
  id: string;
  student: {
    id: string;
    fullName: string;
    studentNumber: string | null;
    registrationNumber: string | null;
    email: string;
  };
};

export default function PasswordResetsClient() {
  const router = useRouter();
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/v1/password-resets');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load requests');
      setRequests(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT') {
      if (!confirm('Are you sure you want to reject this request?')) return;
    }
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/v1/password-resets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to process request');
      
      if (action === 'APPROVE') {
        setTempPassword(data.temporaryPassword);
      }
      
      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== id));
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="content-wrapper"><p>Loading requests…</p></div>;
  }

  return (
    <div className="content-wrapper">
      <header className="page-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.375rem' }}>Password resets</div>
          <h1>Reset requests</h1>
          <p>Approve or reject pending password reset requests.</p>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '12px' }}>
          {error}
        </div>
      )}

      <div className="ledger-panel" style={{ overflow: 'hidden' }}>
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student no.</th>
                <th>Registration no.</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No pending password reset requests.
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{req.student.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{req.student.email}</div>
                    </td>
                    <td className="reg-number">{req.student.studentNumber || '—'}</td>
                    <td className="reg-number">{req.student.registrationNumber || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleAction(req.id, 'APPROVE')}
                          disabled={processingId === req.id}
                        >
                          {processingId === req.id ? 'Processing…' : 'Approve'}
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleAction(req.id, 'REJECT')}
                          disabled={processingId === req.id}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tempPassword && (
        <div className="modal-overlay" onClick={() => setTempPassword(null)}>
          <div 
            className="modal-content"
            style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Password reset</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Share this temporary password with the student — they should use it to log in immediately.
            </p>
            <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-strong)', marginBottom: '1.5rem' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--color-primary)' }}>{tempPassword}</code>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setTempPassword(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
