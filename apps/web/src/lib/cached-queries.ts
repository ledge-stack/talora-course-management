import { unstable_cache } from 'next/cache';
import { db } from '@talora/database';

/**
 * Cached Queries — Performance Layer
 *
 * These functions cache shared, class-wide data using Next.js unstable_cache.
 * Cache tags allow targeted invalidation when a Class Rep makes a change.
 *
 * Strategy:
 * - Timetable events, announcements: cached 5 minutes (changes rarely)
 * - KPI stats (group counts, submission counts): cached 60 seconds (changes more often)
 * - User-specific data (notifications, my group): NOT cached (personal data, must be fresh)
 */

/** Fetch timetable events for a set of offering IDs (shared by all students in that class) */
export const getCachedTimetableEvents = (offeringIds: string[]) =>
  unstable_cache(
    () =>
      db.timetableEvent.findMany({
        where: { offeringId: { in: offeringIds } },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
    ['timetable-events', ...offeringIds],
    {
      tags: offeringIds.map((id) => `timetable-${id}`),
      revalidate: 300, // 5 minutes
    }
  )();

/** Fetch latest announcements for an offering (shared by all students) */
export const getCachedAnnouncements = (offeringId: string) =>
  unstable_cache(
    () =>
      db.announcement.findMany({
        where: { offeringId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { author: { select: { fullName: true } } },
      }),
    ['announcements', offeringId],
    {
      tags: [`announcements-${offeringId}`],
      revalidate: 60, // 1 minute
    }
  )();

/** Fetch KPI counts for an offering. Cached 60s — stale is acceptable for aggregate stats. */
export const getCachedOfferingKPIs = (offeringId: string, classId: string, termId: string) =>
  unstable_cache(
    async () => {
      const [
        totalEnrolled,
        studentsInGroups,
        groups,
        requests,
        issues,
        deadlines,
        totalSubmissions,
        latestAssignment,
        dbDeadlines,
        offeringSettings,
      ] = await Promise.all([
        db.enrollment.count({ where: { offeringId } }),
        db.groupMembership.count({ where: { offeringId } }),
        db.group.findMany({
          where: { offeringId },
          include: { _count: { select: { memberships: true } } },
        }),
        db.groupChangeRequest.count({ where: { status: 'PENDING', group: { offeringId } } }),
        db.issue.count({ where: { offeringId, status: 'OPEN' } }),
        db.assignment.count({ where: { offeringId, dueDate: { gte: new Date() } } }),
        db.submission.count({ where: { assignment: { offeringId } } }),
        db.assignment.findFirst({
          where: { offeringId, dueDate: { gte: new Date() } },
          orderBy: { dueDate: 'asc' },
        }),
        db.assignment.findMany({
          where: { offeringId, dueDate: { gte: new Date() } },
          orderBy: { dueDate: 'asc' },
          take: 3,
        }),
        db.courseOffering.findUnique({ where: { id: offeringId }, select: { minGroupSize: true } })
      ]);

      const minSize = offeringSettings?.minGroupSize || 4;

      return {
        totalEnrolled,
        ungrouped: totalEnrolled - studentsInGroups,
        incomplete: groups.filter((g) => g._count.memberships < minSize).length,
        requests,
        issues,
        deadlines,
        totalSubmissions,
        latestAssignment,
        dbDeadlines,
      };
    },
    ['offering-kpis', offeringId],
    {
      tags: [`kpis-${offeringId}`],
      revalidate: 60, // 1 minute
    }
  )();

/** Fetch all offerings for a class + term (used by timetable, course switcher) */
export const getCachedClassOfferings = (classId: string, termId: string) =>
  unstable_cache(
    () =>
      db.courseOffering.findMany({
        where: { classId, termId },
        include: { unit: true },
      }),
    ['class-offerings', classId, termId],
    {
      tags: [`class-offerings-${classId}-${termId}`],
      revalidate: 300, // 5 minutes
    }
  )();
