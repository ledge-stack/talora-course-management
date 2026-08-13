import React from 'react';
import Link from 'next/link';

export default function RosterImportWizard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <header>
        <Link href="/roster" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
          ← Back to Roster
        </Link>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Import Roster</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.875rem' }}>
          Upload a CSV file containing your student roster to bulk import into this offering.
        </p>
      </header>

      {/* Stepper */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>1</div>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Upload CSV</span>
        </div>
        <div style={{ flex: 1, height: '2px', background: 'var(--border-strong)', margin: '0 1rem' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>2</div>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Map Columns</span>
        </div>
        <div style={{ flex: 1, height: '2px', background: 'var(--border-strong)', margin: '0 1rem' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>3</div>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Review & Import</span>
        </div>
      </div>

      {/* Upload Area */}
      <div className="glass-panel" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-strong)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Click to upload or drag and drop</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          CSV files only. Maximum file size 5MB.
        </p>
        <button className="btn-secondary">
          Select File
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <Link href="/roster" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Cancel
        </Link>
        <button className="btn-primary">
          Next Step →
        </button>
      </div>
    </div>
  );
}
