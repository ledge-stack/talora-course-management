import React from 'react';
import '../globals.css';
import AcademicScopeSelector from '../../components/AcademicScopeSelector';
import RoleSwitcher from '../../components/RoleSwitcher';

export const metadata = {
  title: 'Talora — Class & Group Coordination Platform',
  description: 'API-first university class coordination, group formation, and submission management platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          <aside className="sidebar glass-panel" style={{ borderLeft: 'none', borderTop: 'none', borderBottom: 'none', borderRadius: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Talora
            </div>
            {/* Sidebar Navigation goes here */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Menu</div>
              <a href="#" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Dashboard</a>
              <a href="#" style={{ color: 'var(--color-text-secondary)', fontWeight: 500, transition: 'color 0.15s' }}>Roster</a>
              <a href="#" style={{ color: 'var(--color-text-secondary)', fontWeight: 500, transition: 'color 0.15s' }}>Groups</a>
              <a href="#" style={{ color: 'var(--color-text-secondary)', fontWeight: 500, transition: 'color 0.15s' }}>Assignments</a>
              <a href="#" style={{ color: 'var(--color-text-secondary)', fontWeight: 500, transition: 'color 0.15s' }}>Issues</a>
            </nav>
          </aside>
          
          <main className="main-content">
            <header className="topbar">
              <div className="scope-selector">
                <AcademicScopeSelector />
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="search-bar glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Search...
                </div>
                {/* Notification Bell */}
                <button style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🔔
                </button>
                <RoleSwitcher />
                {/* Profile Avatar */}
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  L
                </div>
              </div>
            </header>
            <div className="content-wrapper">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
