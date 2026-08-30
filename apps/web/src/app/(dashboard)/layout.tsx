import React from 'react';
import { cookies, headers } from 'next/headers';
import SidebarNav from './SidebarNav';
import CourseSwitcher from '../../components/CourseSwitcher';
import DashboardClientShell from './DashboardClientShell';
import PhoneOnboardingModal from './PhoneOnboardingModal';

export const metadata = {
  title: 'Talora — Class & Group Coordination Platform',
  description: 'API-first university class coordination, group formation, and submission management platform.',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const token = cookies().get('talora_token')?.value;
  let userInitials = 'U';
  let userName = 'Unknown User';
  let userRole = 'Student';
  let unreadCount = 0;
  let userNeedsOnboarding = false;
  let currentUserId = '';

  let availableOfferings: any[] = [];
  const activeOfferingId: string | null = cookies().get('active_offering_id')?.value || null;
  const scopeHeader = headers().get('x-user-scope');

  if (scopeHeader) {
    try {
      const payload = JSON.parse(scopeHeader);
      const { db } = await import('@talora/database');
      const user = await db.user.findUnique({ where: { id: payload.userId } });
      if (user) {
        currentUserId = user.id;
        userNeedsOnboarding = !user.phoneNumber || !user.acceptedTerms;
        userName = user.fullName;
        userInitials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        // Prioritize showing the highest role
        const topRole = payload.roles.find((r: any) => r.role === 'PLATFORM_ADMIN') 
                     || payload.roles.find((r: any) => r.role === 'CLASS_REPRESENTATIVE') 
                     || payload.roles[0];
                     
        userRole = topRole?.role?.replace('_', ' ')?.toLowerCase() || 'Student';
        unreadCount = await db.notification.count({ where: { userId: user.id, isRead: false } });

        // Fetch available offerings for this user
        // We look at their enrollments
        const enrollments = await db.enrollment.findMany({
          where: { studentId: user.id },
          include: { offering: { include: { unit: true, class: true, term: true } } }
        });
        availableOfferings = enrollments.map(e => ({
          id: e.offering.id,
          unit: { title: e.offering.unit.title },
          class: { name: e.offering.class.name }
        }));

        if (availableOfferings.length === 0) {
          const rawOfferings = await db.courseOffering.findMany({
            include: { unit: true, class: true, term: true },
            take: 10
          });
          availableOfferings = rawOfferings.map((o: any) => ({
            id: o.id,
            unit: { title: o.unit.title, code: o.unit.code },
            class: { name: o.class.name }
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Build course context label for sidebar
  const activeOffering = availableOfferings.find((o: any) => o.id === activeOfferingId) || availableOfferings[0];
  const courseContext = activeOffering
    ? `${activeOffering.class?.name} · ${activeOffering.unit?.title}`
    : '';

  const sidebarContent = (
    <SidebarNav
      userRole={userRole}
      unreadCount={unreadCount}
      userName={userName}
      userInitials={userInitials}
      courseContext={courseContext}
    />
  );

  const topbarContent = (
    <>
      <CourseSwitcher availableOfferings={availableOfferings} activeOfferingId={activeOfferingId} />
      <form action="/api/v1/auth/logout" method="POST">
        <button type="submit" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.375rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Log out</button>
      </form>
    </>
  );

  if (userNeedsOnboarding) {
    return (
      <div className="flex h-screen bg-bg-base overflow-hidden w-full items-center justify-center">
        <PhoneOnboardingModal userId={currentUserId} />
      </div>
    );
  }

  return (
    <DashboardClientShell sidebarContent={sidebarContent} topbarContent={topbarContent}>
      {children}
    </DashboardClientShell>
  );
}
