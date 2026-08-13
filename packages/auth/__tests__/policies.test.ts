import { isPlatformAdmin, canManageClass, canManageGroup, canViewOffering, UserScope } from '../src/index';

describe('Authorization Policies', () => {
  const platformAdmin: UserScope = {
    userId: 'admin-1',
    roles: [{ role: 'PLATFORM_ADMIN' }],
  };

  const classRep: UserScope = {
    userId: 'rep-1',
    roles: [{ role: 'CLASS_REPRESENTATIVE', classId: 'class-1' }],
  };

  const groupLeader: UserScope = {
    userId: 'leader-1',
    roles: [{ role: 'GROUP_LEADER', groupId: 'group-1' }],
  };

  const student: UserScope = {
    userId: 'student-1',
    roles: [{ role: 'STUDENT', offeringId: 'offering-1' }],
  };

  const unprivileged: UserScope = {
    userId: 'nobody-1',
    roles: [],
  };

  describe('isPlatformAdmin', () => {
    it('returns true for platform admin', () => {
      expect(isPlatformAdmin(platformAdmin)).toBe(true);
    });
    it('returns false for others', () => {
      expect(isPlatformAdmin(classRep)).toBe(false);
      expect(isPlatformAdmin(groupLeader)).toBe(false);
      expect(isPlatformAdmin(student)).toBe(false);
      expect(isPlatformAdmin(unprivileged)).toBe(false);
    });
  });

  describe('canManageClass', () => {
    it('returns true for platform admin', () => {
      expect(canManageClass(platformAdmin, 'class-1')).toBe(true);
    });
    it('returns true for matching class rep', () => {
      expect(canManageClass(classRep, 'class-1')).toBe(true);
    });
    it('returns false for non-matching class rep', () => {
      expect(canManageClass(classRep, 'class-2')).toBe(false);
    });
    it('returns false for others', () => {
      expect(canManageClass(groupLeader, 'class-1')).toBe(false);
      expect(canManageClass(student, 'class-1')).toBe(false);
    });
  });

  describe('canManageGroup', () => {
    it('returns true for platform admin', () => {
      expect(canManageGroup(platformAdmin, 'group-1')).toBe(true);
    });
    it('returns true for matching group leader', () => {
      expect(canManageGroup(groupLeader, 'group-1')).toBe(true);
    });
    it('returns false for non-matching group leader', () => {
      expect(canManageGroup(groupLeader, 'group-2')).toBe(false);
    });
    it('returns false for others', () => {
      expect(canManageGroup(classRep, 'group-1')).toBe(false);
      expect(canManageGroup(student, 'group-1')).toBe(false);
    });
  });

  describe('canViewOffering', () => {
    it('returns true for platform admin', () => {
      expect(canViewOffering(platformAdmin, 'offering-1')).toBe(true);
    });
    it('returns true for matching student', () => {
      expect(canViewOffering(student, 'offering-1')).toBe(true);
    });
    it('returns false for non-matching student', () => {
      expect(canViewOffering(student, 'offering-2')).toBe(false);
    });
    it('returns true for matching class rep (requires classId)', () => {
      expect(canViewOffering(classRep, 'offering-1', 'class-1')).toBe(true);
    });
    it('returns false for non-matching class rep', () => {
      expect(canViewOffering(classRep, 'offering-1', 'class-2')).toBe(false);
      // Fails if classId is omitted for rep
      expect(canViewOffering(classRep, 'offering-1')).toBe(false);
    });
    it('returns false for others', () => {
      expect(canViewOffering(groupLeader, 'offering-1')).toBe(false);
      expect(canViewOffering(unprivileged, 'offering-1')).toBe(false);
    });
  });
});
