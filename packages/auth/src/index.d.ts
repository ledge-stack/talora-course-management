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
export declare function isPlatformAdmin(user: UserScope): boolean;
export declare function canManageClass(user: UserScope, classId: string): boolean;
export declare function canManageGroup(user: UserScope, groupId: string): boolean;
export declare function canViewOffering(user: UserScope, offeringId: string, classId?: string): boolean;
export * from './jwt';
export * from './password';
