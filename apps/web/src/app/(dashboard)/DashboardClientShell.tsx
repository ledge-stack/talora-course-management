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

  // Automatically close mobile sidebar when the route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <CommandPalette />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-bg-sidebar border-r border-border-subtle transform transition-transform duration-300 ease-in-out flex flex-col lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 lg:h-20 bg-topbar-bg backdrop-blur-md border-b border-border-subtle px-4 lg:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {/* Hamburger (hidden on lg+) */}
            <button 
              className="lg:hidden p-2 -ml-2 rounded-md text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors" 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            {/* Breadcrumb (hidden on base/sm, visible on md+) */}
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-text-secondary">
              Dashboard
              {pathname !== '/' && (
                <>
                  <span className="text-border-strong">/</span>
                  <span className="text-text-primary">
                    {pathname.split('/')[1]?.charAt(0).toUpperCase() + pathname.split('/')[1]?.slice(1)}
                  </span>
                </>
              )}
            </div>

            {/* Command Palette Hint */}
            <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1.5 bg-bg-surface rounded-md border border-border-subtle text-xs text-text-muted cursor-pointer hover:bg-bg-surface-hover transition-colors" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Search...</span>
              <kbd className="ml-2 font-sans font-semibold bg-bg-base px-1.5 py-0.5 rounded border border-border-strong">⌘K</kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {topbarContent}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
