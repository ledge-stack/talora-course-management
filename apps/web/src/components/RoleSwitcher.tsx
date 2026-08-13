import React from 'react';

export default function RoleSwitcher() {
  return (
    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Role:</div>
      <select style={{ background: 'transparent', border: 'none', color: 'var(--color-text-accent)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 500 }}>
        <option value="platform_admin" style={{ color: '#000' }}>Platform Admin</option>
        <option value="class_representative" style={{ color: '#000' }}>Class Representative</option>
        <option value="student" style={{ color: '#000' }}>Student</option>
      </select>
    </div>
  );
}
