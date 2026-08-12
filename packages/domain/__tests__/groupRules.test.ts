import {
  validateGroupPolicy,
  validateGroupCapacity,
  deriveGroupStatus,
  DEFAULT_GROUP_POLICY,
} from '../src/rules/groupRules';

describe('Group Rules', () => {
  describe('Group Policy Validation', () => {
    test('validates valid group policy limits', () => {
      expect(validateGroupPolicy({ minSize: 5, maxSize: 10 }).valid).toBe(true);
    });

    test('rejects policy where max is less than min', () => {
      const result = validateGroupPolicy({ minSize: 10, maxSize: 5 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be less than minimum');
    });

    test('rejects policy where min size is less than 1', () => {
      const result = validateGroupPolicy({ minSize: 0, maxSize: 5 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 1');
    });

    test('validates policy where min size equals max size', () => {
      expect(validateGroupPolicy({ minSize: 5, maxSize: 5 }).valid).toBe(true);
    });

    test('uses defaults if partial policy is provided', () => {
      // DEFAULT is min: 5, max: 10
      expect(validateGroupPolicy({ minSize: 6 }).valid).toBe(true);
      expect(validateGroupPolicy({ maxSize: 4 }).valid).toBe(false); // 4 < default min (5)
    });
  });

  describe('Group Capacity Validation', () => {
    test('allows capacity when current count is below max', () => {
      expect(validateGroupCapacity(4, 5).valid).toBe(true);
      expect(validateGroupCapacity(0, 5).valid).toBe(true);
    });

    test('rejects capacity when current count is at max (boundary)', () => {
      const result = validateGroupCapacity(5, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum capacity');
    });

    test('rejects capacity when current count exceeds max', () => {
      expect(validateGroupCapacity(6, 5).valid).toBe(false);
    });
  });

  describe('Group Status Derivation', () => {
    test('returns forming when member count is below minimum', () => {
      expect(deriveGroupStatus(3, DEFAULT_GROUP_POLICY)).toBe('forming');
    });

    test('returns complete when member count reaches minimum (boundary)', () => {
      expect(deriveGroupStatus(5, DEFAULT_GROUP_POLICY)).toBe('complete');
    });

    test('returns complete when member count exceeds minimum', () => {
      expect(deriveGroupStatus(7, DEFAULT_GROUP_POLICY)).toBe('complete');
    });

    test('returns locked when group is explicitly locked, regardless of count', () => {
      expect(deriveGroupStatus(3, DEFAULT_GROUP_POLICY, true)).toBe('locked');
      expect(deriveGroupStatus(10, DEFAULT_GROUP_POLICY, true)).toBe('locked');
    });
  });
});
