const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      memberships: {
        include: { student: true }
      }
    }
  });

  groups.forEach(g => {
    console.log(`Group: ${g.name}, LeaderID: ${g.leaderId}, Members: ${g.memberships.length}`);
    g.memberships.forEach(m => {
       console.log(`  - Member: ${m.student.fullName} (ID: ${m.studentId})`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
