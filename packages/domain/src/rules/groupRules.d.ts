/**
 * Group Management Business Rules
 */
export interface GroupPolicy {
    minSize: number;
    maxSize: number;
    allowStudentCreatedGroups: boolean;
}
export declare const DEFAULT_GROUP_POLICY: GroupPolicy;
export declare function validateGroupPolicy(policy: Partial<GroupPolicy>): {
    valid: boolean;
    error?: string;
};
export declare function validateGroupCapacity(currentMemberCount: number, maxSize: number): {
    valid: boolean;
    error?: string;
};
export type GroupStatus = 'forming' | 'complete' | 'incomplete' | 'locked' | 'archived';
export declare function deriveGroupStatus(memberCount: number, policy: GroupPolicy, isLocked?: boolean): GroupStatus;
