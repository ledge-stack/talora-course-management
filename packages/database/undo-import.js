const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const offeringId = '7bcf49a8-d1ef-46e5-ae14-2a3ccb708efa';
  const cutoffDate = new Date('2026-08-27T19:00:00Z');

  // 1. Delete group memberships for groups created after the cutoff
  const recentGroups = await prisma.group.findMany({
    where: { offeringId, createdAt: { gte: cutoffDate } },
    select: { id: true }
  });
  
  if (recentGroups.length > 0) {
    const groupIds = recentGroups.map(g => g.id);
    const delMemberships = await prisma.groupMembership.deleteMany({
      where: { groupId: { in: groupIds } }
    });
    console.log(`Deleted ${delMemberships.count} group memberships.`);

    const delGroups = await prisma.group.deleteMany({
      where: { id: { in: groupIds } }
    });
    console.log(`Deleted ${delGroups.count} groups.`);
  } else {
    console.log('No recent groups found.');
  }

  // 2. Delete enrollments created after cutoff
  const delEnrollments = await prisma.enrollment.deleteMany({
    where: { offeringId, createdAt: { gte: cutoffDate } }
  });
  console.log(`Deleted ${delEnrollments.count} enrollments.`);

  // 3. Find newly created user accounts (temp accounts) by looking at users created after cutoff
  // We should be careful to only delete users that don't have other enrollments or roles
  // Actually, to be safe, the easiest way to detect users created strictly from the roster import
  // is to see if their createdAt is after cutoff AND they have a passwordHash length of exactly 16 (hex representation of 8 bytes)
  const recentUsers = await prisma.user.findMany({
    where: { createdAt: { gte: cutoffDate } },
    include: { enrollments: true, memberships: true, roles: true }
  });

  let deletedUsers = 0;
  for (const user of recentUsers) {
    // If they have no enrollments and no roles left (or only STUDENT role on this class), we can safely delete them.
    // The import creates a STUDENT role if it's a CLASS_ROSTER import.
    if (user.enrollments.length === 0 && user.memberships.length === 0) {
       // Delete their roles first
       await prisma.userRole.deleteMany({ where: { userId: user.id } });
       // Delete the user
       await prisma.user.delete({ where: { id: user.id } });
       deletedUsers++;
    }
  }
  
  console.log(`Deleted ${deletedUsers} orphaned user accounts.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
