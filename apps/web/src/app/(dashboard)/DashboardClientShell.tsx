'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

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

  // Automatically close mobile sidebar when the route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="layout-container">
      {/* Dark overlay for mobile when sidebar is open */}
      <div 
        className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {sidebarContent}
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger Menu (only visible on mobile via CSS) */}
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            <div className="hide-on-mobile" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Dashboard
              {pathname !== '/' && (
                <>
                  <span style={{ color: 'var(--border-strong)' }}>/</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {pathname.split('/')[1]?.charAt(0).toUpperCase() + pathname.split('/')[1]?.slice(1)}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {topbarContent}
          </div>
        </header>

        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
