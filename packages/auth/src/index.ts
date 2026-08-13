/**
 * Role-based & Scope-based authorization logic for Talora
 */

export type Role = 'PLATFORM_ADMIN' | 'CLASS_REPRESENTATIVE' | 'GROUP_LEADER' | 'STUDENT';

export interface UserScope {
  userId: string;
  roles: Array<{
    role: Role;
    classId?: string;
    offeringId?: string;
    groupId?: string;
  }>;
}

export function isPlatformAdmin(user: UserScope): boolean {
  return user.roles.some((r) => r.role === 'PLATFORM_ADMIN');
}

export function canManageClass(user: UserScope, classId: string): boolean {
  if (isPlatformAdmin(user)) return true;
  return user.roles.some(
    (r) => r.role === 'CLASS_REPRESENTATIVE' && r.classId === classId
  );
}

export function canManageGroup(user: UserScope, groupId: string): boolean {
  if (isPlatformAdmin(user)) return true;
  return user.roles.some((r) => r.role === 'GROUP_LEADER' && r.groupId === groupId);
}

export function canViewOffering(user: UserScope, offeringId: string, classId?: string): boolean {
  if (isPlatformAdmin(user)) return true;
  return user.roles.some((r) => {
    if (r.role === 'STUDENT' && r.offeringId === offeringId) return true;
    if (r.role === 'CLASS_REPRESENTATIVE' && classId && r.classId === classId) return true;
    return false;
  });
}
