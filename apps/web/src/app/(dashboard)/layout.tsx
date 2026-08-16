import React from 'react';
import { cookies } from 'next/headers';
import { verifyJwt } from '@talora/auth';
import RoleBadge from '../../components/RoleBadge';
import SidebarNav from './SidebarNav';

export const metadata = {
  title: 'Talora — Class & Group Coordination Platform',
  description: 'API-first university class coordination, group formation, and submission management platform.',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('talora_token')?.value;
  let userInitials = 'U';
  let userName = 'Unknown User';
  let userRole = 'Student';
  let unreadCount = 0;

  if (token) {
    try {
      const payload = await verifyJwt(token);
      const { db } = await import('@talora/database');
      const user = await db.user.findUnique({ where: { id: payload.userId } });
      if (user) {
        userName = user.fullName;
        userInitials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        userRole = payload.roles[0]?.role?.replace('_', ' ')?.toLowerCase() || 'Student';
        unreadCount = await db.notification.count({ where: { userId: user.id, isRead: false } });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">T</div>
          <div className="sidebar-logo-name">Talora</div>
        </div>

        {/* Navigation Extracted to Client Component */}
        <SidebarNav userRole={userRole} unreadCount={unreadCount} />

        {/* User Card */}
        <div style={{ padding: '0 1rem 1.5rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-subtle)' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', background: 'var(--color-primary)', color: 'white' }}>{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{userRole}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <RoleBadge role={userRole} />
            <form action="/api/v1/auth/logout" method="POST">
              <button type="submit" className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>Logout</button>
            </form>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
