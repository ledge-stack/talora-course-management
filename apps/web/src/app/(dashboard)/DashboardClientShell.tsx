'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import CommandPalette from '../../components/CommandPalette';

export default function DashboardClientShell({
  sidebarContent,
  topbarContent,
  children
}: {
  sidebarContent: React.ReactNode,
  topbarContent: React.ReactNode,
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--color-bg-base)', overflow: 'hidden' }}>
      <CommandPalette />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 40
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Ledger Sidebar */}
      <aside className={`ledger-sidebar${isSidebarOpen ? ' open' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Main */}
      <main className="with-sidebar" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100dvh', overflowY: 'auto' }}>
        {/* Topbar */}
        <header className="ledger-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger for mobile */}
            <button
              className="btn-ghost"
              style={{ padding: '0.375rem', display: 'none' }}
              id="sidebar-toggle"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Talora
              </span>
              {pathname !== '/' && (
                <>
                  <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>/</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {pathname.split('/').filter(Boolean)[0]}
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {topbarContent}
          </div>
        </header>

        {/* Page content */}
        <div className="content-wrapper" style={{ flex: 1, padding: '1.5rem 2rem' }}>
          {children}
        </div>
      </main>

      {/* Mobile hamburger reveal */}
      <style>{`
        @media (max-width: 1024px) {
          #sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
