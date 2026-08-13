import React from 'react';
import Link from 'next/link';
import '../globals.css';
import AcademicScopeSelector from '../../components/AcademicScopeSelector';
import RoleSwitcher from '../../components/RoleSwitcher';

export const metadata = {
  title: 'Talora — Class & Group Coordination Platform',
  description: 'API-first university class coordination, group formation, and submission management platform.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>CR</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>ClassRep</div>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--color-primary-transparent)', color: 'var(--color-primary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📊</span> Dashboard</div>
          </Link>
          <Link href="/roster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>👥</span> Roster</div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>42</span>
          </Link>
          <Link href="/offerings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📅</span> Offerings & Timetable</div>
          </Link>
          <Link href="/groups" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📚</span> Groups</div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>3</span>
          </Link>
          <Link href="/announcements" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📣</span> Announcements</div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>2</span>
          </Link>
          <Link href="/assignments" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>📝</span> Assignments</div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>5</span>
          </Link>
          <Link href="/issues" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>⚠️</span> Issues</div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>7</span>
          </Link>
          <Link href="/imports" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>🔄</span> Imports & Exports</div>
          </Link>

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', padding: '0 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Platform Admin
          </div>
          <Link href="/admin/institutions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>🏢</span> Institutions</div>
          </Link>
          <Link href="/admin/users" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>🛡️</span> Users & Roles</div>
          </Link>
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/notifications" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>🔔</span> Notifications</div>
            <span className="badge badge-danger">4</span>
          </Link>
          <Link href="/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', color: 'var(--color-text-secondary)', borderRadius: '8px', fontWeight: 500, fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span>👤</span> Profile</div>
          </Link>
        </div>
      </aside>
      
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <AcademicScopeSelector />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <RoleSwitcher />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
              JD
            </div>
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
