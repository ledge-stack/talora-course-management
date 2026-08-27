import React from 'react';
import { cookies, headers } from 'next/headers';
import RoleBadge from '../../components/RoleBadge';
import SidebarNav from './SidebarNav';

import CourseSwitcher from '../../components/CourseSwitcher';
import DashboardClientShell from './DashboardClientShell';
import PhoneOnboardingModal from './PhoneOnboardingModal';

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

        // Fallback: if not enrolled in anything but they are a rep/admin, just fetch all active term offerings
        if (availableOfferings.length === 0) {
          const rawOfferings = await db.courseOffering.findMany({
            include: { unit: true, class: true, term: true },
            take: 10
          });
          availableOfferings = rawOfferings.map((o: any) => ({
            id: o.id,
            unit: { title: o.unit.title },
            class: { name: o.class.name }
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  const sidebarContent = (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-border-subtle">
        <div className="w-8 h-8 bg-primary rounded-md text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/30">T</div>
        <div className="font-display text-xl font-bold text-text-primary">Talora</div>
      </div>



      <SidebarNav userRole={userRole} unreadCount={unreadCount} />

      <div className="px-4 pb-6 mt-auto">
        <div className="p-3 bg-bg-surface rounded-lg flex items-center gap-3 border border-border-subtle">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0">{userInitials}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[0.8125rem] font-semibold text-text-primary truncate">{userName}</div>
            <div className="text-[0.7rem] text-text-muted truncate capitalize">{userRole}</div>
          </div>
        </div>
      </div>
    </>
  );

  const topbarContent = (
    <>
      <CourseSwitcher availableOfferings={availableOfferings} activeOfferingId={activeOfferingId} />
      <div className="hidden sm:block"><RoleBadge role={userRole} /></div>
      <form action="/api/v1/auth/logout" method="POST">
        <button type="submit" className="px-3 py-1.5 text-xs bg-bg-surface-hover hover:bg-bg-surface-active text-text-primary rounded-md transition-colors border border-border-strong font-medium">Logout</button>
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
