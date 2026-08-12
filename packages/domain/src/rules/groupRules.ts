/**
 * Group Management Business Rules
 */

export interface GroupPolicy {
  minSize: number;
  maxSize: number;
  allowStudentCreatedGroups: boolean;
}

export const DEFAULT_GROUP_POLICY: GroupPolicy = {
  minSize: 5,
  maxSize: 10,
  allowStudentCreatedGroups: true,
};

export function validateGroupPolicy(policy: Partial<GroupPolicy>): { valid: boolean; error?: string } {
  const min = policy.minSize ?? DEFAULT_GROUP_POLICY.minSize;
  const max = policy.maxSize ?? DEFAULT_GROUP_POLICY.maxSize;

  if (min < 1) {
    return { valid: false, error: 'Minimum group size must be at least 1' };
  }
  if (max < min) {
    return { valid: false, error: 'Maximum group size cannot be less than minimum group size' };
  }
  return { valid: true };
}

export function validateGroupCapacity(
  currentMemberCount: number,
  maxSize: number
): { valid: boolean; error?: string } {
  if (currentMemberCount >= maxSize) {
    return { valid: false, error: 'Group has reached maximum capacity' };
  }
  return { valid: true };
}

export type GroupStatus = 'forming' | 'complete' | 'incomplete' | 'locked' | 'archived';

export function deriveGroupStatus(
  memberCount: number,
  policy: GroupPolicy,
  isLocked = false
): GroupStatus {
  if (isLocked) return 'locked';
  if (memberCount >= policy.minSize) return 'complete';
  return 'forming';
}
