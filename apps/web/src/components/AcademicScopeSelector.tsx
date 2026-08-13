import React from 'react';

export default function AcademicScopeSelector() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
      <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>🗓️</span> Fall 2024 <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.25rem' }}>▼</span>
      </button>
      
      <span style={{ color: 'var(--border-strong)' }}>/</span>
      
      <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>🎓</span> CS-301 <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.25rem' }}>▼</span>
      </button>
      
      <span style={{ color: 'var(--border-strong)' }}>/</span>
      
      <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>📖</span> Data Structures — Sec A <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.25rem' }}>▼</span>
      </button>
    </div>
  );
}
