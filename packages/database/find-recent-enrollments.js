const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const recentEnrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      offering: {
        include: {
          unit: true,
          term: true,
          class: true
        }
      },
      student: { select: { fullName: true } }
    }
  });
  console.log(JSON.stringify(recentEnrollments.map(e => ({
    student: e.student.fullName,
    offeringId: e.offeringId,
    course: e.offering.unit.title,
    createdAt: e.createdAt
  })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
