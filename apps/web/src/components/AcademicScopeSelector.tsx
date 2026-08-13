import React from 'react';

export default function AcademicScopeSelector() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <select className="glass-panel" style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <option value="term_1" style={{ color: '#000' }}>Fall 2026</option>
        <option value="term_2" style={{ color: '#000' }}>Spring 2027</option>
      </select>
      
      <span style={{ color: 'var(--color-text-secondary)' }}>/</span>
      
      <select className="glass-panel" style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <option value="class_1" style={{ color: '#000' }}>CS101 - Intro to CS</option>
        <option value="class_2" style={{ color: '#000' }}>CS201 - Data Structures</option>
      </select>
    </div>
  );
}
