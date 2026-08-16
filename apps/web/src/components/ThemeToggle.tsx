'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with the same dimensions to avoid layout shift
    return <div style={{ height: '36px', width: '100%', borderRadius: '8px', background: 'var(--color-bg-surface-hover)' }} />;
  }

  const isLight = resolvedTheme === 'light';

  return (
    <button 
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        background: 'var(--color-bg-surface-hover)',
        color: 'var(--color-text-primary)',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all var(--transition-fast)',
        border: '1px solid var(--border-subtle)',
        cursor: 'pointer'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {isLight ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
        {isLight ? 'Light Mode' : 'Dark Mode'}
      </span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Toggle</span>
    </button>
  );
}
