import { db } from '@talora/database';
import { cookies } from 'next/headers';
import type { UserScope } from '@talora/auth';

export function getActiveOfferingId(): string | null {
  const cookieStore = cookies();
  const offeringId = cookieStore.get('active_offering_id');
  return offeringId?.value || null;
}

/**
 * Resolves the "active" course offering for a given user, safely scoped to
 * only offerings the user is authorized to access.
 *
 * Resolution order:
 *  1. The `active_offering_id` cookie — validated against the user's access
 *  2. The user's first enrollment (for students)
 *  3. The first offering belonging to the user's assigned class (for reps)
 *  4. null — if none of the above match
 *
 * A Class Representative is only ever shown an offering for their specific
 * classId, preventing cross-class data leakage.
 */
export async function resolveAuthorizedOffering(scope: UserScope): Promise<any | null> {
  const includeRelations = { unit: true, term: true, class: true };

  const isRep = scope.roles.some(
    (r: any) => r.role === 'CLASS_REPRESENTATIVE' || r.role === 'PLATFORM_ADMIN'
  );

  // Determine which classIds this user is authorized to access as a rep
  const repClassIds = scope.roles
    .filter((r: any) => r.role === 'CLASS_REPRESENTATIVE' && r.classId)
    .map((r: any) => r.classId);
  const isPlatformAdmin = scope.roles.some((r: any) => r.role === 'PLATFORM_ADMIN');

  // Step 1: Try the cookie value, but validate it
  const cookieOfferingId = getActiveOfferingId();
  if (cookieOfferingId) {
    const offering = await db.courseOffering.findUnique({
      where: { id: cookieOfferingId },
      include: includeRelations,
    });

    if (offering) {
      // Platform admins can see any offering
      if (isPlatformAdmin) return offering;

      // Reps can only see offerings for their assigned class
      if (repClassIds.length > 0 && repClassIds.includes(offering.classId)) return offering;

      // Students can only see offerings they are enrolled in
      if (!isRep) {
        const enrollment = await db.enrollment.findFirst({
          where: { studentId: scope.userId, offeringId: offering.id },
        });
        if (enrollment) return offering;
      }
    }
    // Cookie pointed to an unauthorized or deleted offering — fall through
  }

  // Step 2: For students — use first enrollment
  if (!isRep) {
    const firstEnrollment = await db.enrollment.findFirst({
      where: { studentId: scope.userId },
      orderBy: { createdAt: 'desc' },
      include: { offering: { include: includeRelations } },
    });
    if (firstEnrollment) return firstEnrollment.offering;
  }

  // Step 3: For reps — use first offering belonging to their class
  if (repClassIds.length > 0) {
    const repOffering = await db.courseOffering.findFirst({
      where: { classId: { in: repClassIds } },
      orderBy: { createdAt: 'desc' },
      include: includeRelations,
    });
    if (repOffering) return repOffering;
  }

  // Step 4: Platform admins fall back to the globally most-recent offering
  if (isPlatformAdmin) {
    return db.courseOffering.findFirst({
      orderBy: { createdAt: 'desc' },
      include: includeRelations,
    });
  }

  return null;
}
