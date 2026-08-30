const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const offeringId = '7bcf49a8-d1ef-46e5-ae14-2a3ccb708efa';
  const cutoffDate = new Date('2026-08-27T19:00:00Z');
  
  const recentEnrollments = await prisma.enrollment.findMany({
    where: { 
      offeringId,
      createdAt: { gte: cutoffDate }
    }
  });

  const recentGroups = await prisma.group.findMany({
    where: { 
      offeringId,
      createdAt: { gte: cutoffDate }
    }
  });

  const recentGroupMemberships = await prisma.groupMembership.findMany({
    where: { 
      offeringId,
      createdAt: { gte: cutoffDate }
    }
  });

  console.log(`Recent Enrollments: ${recentEnrollments.length}`);
  console.log(`Recent Groups: ${recentGroups.length}`);
  console.log(`Recent Group Memberships: ${recentGroupMemberships.length}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
