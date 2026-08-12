import {
  validateGroupPolicy,
  validateGroupCapacity,
  deriveGroupStatus,
  DEFAULT_GROUP_POLICY,
} from '../src/rules/groupRules';

describe('Group Rules', () => {
  test('validates group policy limits', () => {
    expect(validateGroupPolicy({ minSize: 5, maxSize: 10 }).valid).toBe(true);
    expect(validateGroupPolicy({ minSize: 10, maxSize: 5 }).valid).toBe(false);
  });

  test('validates group capacity', () => {
    expect(validateGroupCapacity(4, 5).valid).toBe(true);
    expect(validateGroupCapacity(5, 5).valid).toBe(false);
  });

  test('derives group status based on member count', () => {
    expect(deriveGroupStatus(3, DEFAULT_GROUP_POLICY)).toBe('forming');
    expect(deriveGroupStatus(5, DEFAULT_GROUP_POLICY)).toBe('complete');
    expect(deriveGroupStatus(3, DEFAULT_GROUP_POLICY, true)).toBe('locked');
  });
});
