'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

/* ── SVG Icons ─────────────────────────────────────────────── */
const Icon = {
  Dashboard: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Roster: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Timetable: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Enroll: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/>
    </svg>
  ),
  Groups: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
    </svg>
  ),
  Announce: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  ),
  Password: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Assignments: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Issues: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Bell: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Profile: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Institution: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Shield: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

/* ── NavItem ─────────────────────────────────────────────────── */
function NavItem({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link href={href} className={`nav-item${active ? ' active' : ''}`} title={label}>
      <span className="nav-item-icon">{icon}</span>
      <span className="nav-item-label">{label}</span>
      {badge && badge > 0 ? <span className="nav-badge">{badge}</span> : null}
    </Link>
  );
}

function SidebarThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="nav-item" style={{ opacity: 0 }}><span className="nav-item-icon"></span></div>;
  }

  const isLight = resolvedTheme === 'light';

  return (
    <button 
      className="nav-item" 
      onClick={() => setTheme(isLight ? 'dark' : 'light')} 
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', outline: 'none', padding: 0 }}
    >
      <span className="nav-item-icon">
        {isLight ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </span>
      <span className="nav-item-label">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  );
}
/* ── Main Export ─────────────────────────────────────────────── */
export default function SidebarNav({
  userRole = 'Student',
  unreadCount = 0,
  userName = '',
  userInitials = 'U',
  courseContext = '',
}: {
  userRole?: string;
  unreadCount?: number;
  userName?: string;
  userInitials?: string;
  courseContext?: string;
}) {
  const isRepOrAdmin = userRole.toLowerCase().includes('representative') || userRole.toLowerCase().includes('admin');
  const isAdmin      = userRole.toLowerCase().includes('admin');

  const roleLabel = isAdmin ? 'Admin' : isRepOrAdmin ? 'Rep' : 'Student';

  return (
    <>
      {/* Logo stamp */}
      <div className="sidebar-stamp">
        <span className="sidebar-stamp-letter">T</span>
        <span className="sidebar-stamp-wordmark">alora</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavItem href="/"            icon={<Icon.Dashboard />}   label="Dashboard" />
        {isRepOrAdmin && <NavItem href="/roster"     icon={<Icon.Roster />}     label="Roster" />}
        <NavItem href="/timetable"   icon={<Icon.Timetable />}   label="Timetable" />
        <NavItem href="/enroll"      icon={<Icon.Enroll />}      label="Enroll" />
        <NavItem href="/groups"      icon={<Icon.Groups />}      label="Groups" />
        <NavItem href="/assignments" icon={<Icon.Assignments />} label="Assignments" />

        {/* Course context */}
        {courseContext && (
          <div className="sidebar-context" style={{ padding: '0.5rem 0', margin: '0.25rem 0' }}>
            <div className="sidebar-context-inner">
              <div className="sidebar-context-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <div className="sidebar-context-text">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Now reading
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500, lineHeight: 1.3, maxWidth: '160px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  {courseContext}
                </span>
              </div>
            </div>
          </div>
        )}
        {isRepOrAdmin && (
          <>
            <div className="nav-section-break" style={{ margin: '0.375rem 0' }} />
            <NavItem href="/announcements"  icon={<Icon.Announce />}  label="Announcements" />
            <NavItem href="/issues"          icon={<Icon.Issues />}   label="Issues" />
          </>
        )}

        {isAdmin && (
          <>
            <div className="nav-section-break" style={{ margin: '0.375rem 0' }} />
            <span className="nav-section-label">Platform</span>
            <NavItem href="/admin/institutions" icon={<Icon.Institution />} label="Institutions" />
            <NavItem href="/admin/users"        icon={<Icon.Shield />}      label="Users & Roles" />
          </>
        )}
      </nav>



      {/* Theme + Notifications + Profile */}
      <div style={{ padding: '0.375rem 0', borderTop: '1px solid var(--border-subtle)' }}>
        <NavItem href="/notifications" icon={<Icon.Bell />}    label="Notifications" badge={unreadCount} />
        <NavItem href="/profile"       icon={<Icon.Profile />} label="Profile" />
        <SidebarThemeToggle />
      </div>

      {/* User sign-off */}
      <div className="sidebar-signoff">
        <div className="signoff-avatar">
          <div className="signoff-avatar-inner">{userInitials}</div>
        </div>
        <div className="signoff-text">
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{userName}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
            {roleLabel}
          </span>
        </div>
      </div>
    </>
  );
}
