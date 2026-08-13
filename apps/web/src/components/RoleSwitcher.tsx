import React from 'react';

export default function RoleSwitcher() {
  return (
    <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '8px', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></div>
      <span style={{ color: 'var(--color-text-secondary)' }}>Role:</span>
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Class Representative <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.25rem' }}>▼</span></span>
    </button>
  );
}
