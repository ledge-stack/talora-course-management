import React from 'react';

export default function AcademicScopeSelector() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>🗓️</span> Semester 1
      </div>
      
      <span style={{ color: 'var(--border-strong)' }}>/</span>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>🎓</span> CS-2
      </div>
      
      <span style={{ color: 'var(--border-strong)' }}>/</span>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>📖</span> All Course Units
      </div>

    </div>
  );
}
