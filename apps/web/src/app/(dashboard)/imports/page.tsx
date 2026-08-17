'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function ImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [offeringId, setOfferingId] = useState<string>('');
  const [offerings, setOfferings] = useState<any[]>([]);

  const [jobStatus, setJobStatus] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Note: in a real app, we'd fetch the Class Rep's actual offerings
  useEffect(() => {
    // For demo purposes, fetch the first offering from DB to use its ID
    fetch('/api/v1/offerings')
      .then(res => res.json())
      .then(data => {
        if (data.data) setOfferings(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');
    if (!offerings.length) return alert('No offerings available. (Seed the DB first!)');
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('offeringId', offeringId || offerings[0].id);

    try {
      const res = await fetch('/api/v1/imports/roster', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.data?.jobId) {
        setJobId(data.data.jobId);
        pollJobStatus(data.data.jobId);
      } else {
        alert('Failed to enqueue job');
        setIsUploading(false);
      }
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('Upload failed');
    }
  };

  const pollJobStatus = async (id: string) => {
    let attemptCount = 0;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/imports/status/${id}`);
        const data = await res.json();
        if (data.data) {
          setJobStatus(data.data);
          
          if (data.data.state === 'completed' || data.data.state === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsUploading(false);
          }
        }
      } catch (err) {
        console.error(err);
        attemptCount++;
        if (attemptCount > 5) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setJobStatus({ state: 'failed', failedReason: 'Network error. Polling stopped.' });
          setIsUploading(false);
        }
      }
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header className="page-header">
        <div>
          <h1>Bulk Imports</h1>
          <p>Upload CSV files to automatically enroll students and form groups.</p>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Import Class Roster (Admin / Rep)</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Upload a CSV file containing <strong>FullName</strong>, <strong>Email</strong>, and <strong>StudentNumber</strong> columns.
          The background worker will parse the file, create missing user accounts, and enroll students into your class.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Course Offering</label>
            <select 
              value={offeringId} 
              onChange={e => setOfferingId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)' }}
            >
              {offerings.length === 0 && <option value="">Loading offerings...</option>}
              {offerings.map(o => (
                <option key={o.id} value={o.id}>{o.class?.name || o.id} - {o.unit?.code || 'Course'}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>CSV File</label>
            <div 
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.1)',
                color: 'var(--color-text-secondary)',
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-transparent)'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {file ? (
                <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{file.name}</div>
              ) : (
                <div>Drag and drop your CSV file here, or click to browse</div>
              )}
              <input 
                id="file-upload"
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleUpload} 
            disabled={isUploading || !file}
            style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
          >
            {isUploading ? 'Processing...' : 'Upload & Start Import'}
          </button>
        </div>

        {/* Progress Tracker */}
        {jobStatus && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-bg-base)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Import Status: <span style={{ textTransform: 'capitalize' }}>{jobStatus.state}</span></strong>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{jobStatus.progress ?? 0}%</span>
            </div>
            
            <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${jobStatus.progress ?? 0}%`, 
                background: jobStatus.state === 'failed' ? 'var(--color-danger)' : 'var(--color-primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {jobStatus.state === 'completed' && jobStatus.result && (
              <div style={{ marginTop: '1rem', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Successfully enrolled {jobStatus.result.importedCount} students out of {jobStatus.result.totalRows} rows.
              </div>
            )}

            {jobStatus.state === 'failed' && (
              <div style={{ marginTop: '1rem', color: 'var(--color-danger)', fontSize: '0.875rem', fontWeight: 500 }}>
                Error: {jobStatus.failedReason || 'Unknown error occurred'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
