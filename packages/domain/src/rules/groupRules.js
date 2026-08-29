"use strict";
/**
 * Group Management Business Rules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_GROUP_POLICY = void 0;
exports.validateGroupPolicy = validateGroupPolicy;
exports.validateGroupCapacity = validateGroupCapacity;
exports.deriveGroupStatus = deriveGroupStatus;
exports.DEFAULT_GROUP_POLICY = {
    minSize: 5,
    maxSize: 10,
    allowStudentCreatedGroups: true,
};
function validateGroupPolicy(policy) {
    const min = policy.minSize ?? exports.DEFAULT_GROUP_POLICY.minSize;
    const max = policy.maxSize ?? exports.DEFAULT_GROUP_POLICY.maxSize;
    if (min < 1) {
        return { valid: false, error: 'Minimum group size must be at least 1' };
    }
    if (max < min) {
        return { valid: false, error: 'Maximum group size cannot be less than minimum group size' };
    }
    return { valid: true };
}
function validateGroupCapacity(currentMemberCount, maxSize) {
    if (currentMemberCount >= maxSize) {
        return { valid: false, error: 'Group has reached maximum capacity' };
    }
    return { valid: true };
}
function deriveGroupStatus(memberCount, policy, isLocked = false) {
    if (isLocked)
        return 'locked';
    if (memberCount >= policy.minSize)
        return 'complete';
    return 'forming';
}
