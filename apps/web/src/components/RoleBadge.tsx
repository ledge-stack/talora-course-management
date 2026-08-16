import React from 'react';

export default function RoleBadge({ role = 'Student' }: { role?: string }) {
  // Determine badge color based on role
  let dotColor = 'var(--color-info)'; // Default
  if (role.toLowerCase().includes('admin')) {
    dotColor = 'var(--color-danger)';
  } else if (role.toLowerCase().includes('representative')) {
    dotColor = 'var(--color-warning)';
  } else if (role.toLowerCase().includes('leader')) {
    dotColor = 'var(--color-success)';
  }

  // Capitalize properly
  const formattedRole = role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '8px', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.875rem', cursor: 'default' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }}></div>
      <span style={{ color: 'var(--color-text-secondary)' }}>Role:</span>
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{formattedRole}</span>
    </div>
  );
}
