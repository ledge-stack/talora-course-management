'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnrollPage() {
  const router = useRouter();
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await fetch('/api/v1/offerings?available=true');
        const data = await res.json();
        if (res.ok) {
          setOfferings(data.data || []);
        } else {
          setError(data.error || 'Failed to fetch offerings');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  const handleEnroll = async (offeringId: string) => {
    setEnrollingId(offeringId);
    setError('');
    try {
      const res = await fetch('/api/v1/me/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offeringId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to enroll');
      }

      // Automatically set this as active offering
      document.cookie = `active_offering_id=${offeringId}; path=/; max-age=31536000`;
      
      // Redirect to dashboard
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Course Enrollment</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Select the course units you intend to study this semester.</p>
        </div>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Loading available courses...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {offerings.map(offering => (
            <div key={offering.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  {offering.unit.code} — {offering.unit.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {offering.term.name} • Class: {offering.class.name}
                </div>
                {offering.unit.lecturerName && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    Lecturer: {offering.unit.lecturerName}
                  </div>
                )}
              </div>
              <button 
                className="btn-primary" 
                onClick={() => handleEnroll(offering.id)}
                disabled={enrollingId !== null}
              >
                {enrollingId === offering.id ? 'Enrolling...' : 'Enroll'}
              </button>
            </div>
          ))}

          {offerings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)' }}>
              No available courses found to enroll in.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
