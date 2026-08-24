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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pt-4 sm:pt-8">
      <header className="page-header">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">Course Enrollment</h1>
          <p className="text-text-secondary text-sm">Select the course units you intend to study this semester.</p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-danger-bg text-danger rounded-md text-sm border border-danger/20">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-text-muted p-8">Loading available courses...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {offerings.map(offering => (
            <div key={offering.id} className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors hover:border-border-strong">
              <div className="flex-1">
                <div className="text-lg font-semibold text-text-primary mb-1">
                  {offering.unit.code} — {offering.unit.title}
                </div>
                <div className="text-sm text-text-secondary">
                  {offering.term.name} • Class: {offering.class.name}
                </div>
                {offering.unit.lecturerName && (
                  <div className="text-xs text-text-muted mt-2">
                    Lecturer: {offering.unit.lecturerName}
                  </div>
                )}
              </div>
              <button 
                className="btn-primary w-full sm:w-auto" 
                onClick={() => handleEnroll(offering.id)}
                disabled={enrollingId !== null}
              >
                {enrollingId === offering.id ? 'Enrolling...' : 'Enroll'}
              </button>
            </div>
          ))}

          {offerings.length === 0 && (
            <div className="text-center p-12 bg-bg-surface rounded-md text-text-muted">
              No available courses found to enroll in.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
