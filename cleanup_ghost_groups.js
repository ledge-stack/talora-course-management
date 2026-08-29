const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: { memberships: true, placeholders: true }
      }
    }
  });

  let deleted = 0;
  for (const group of groups) {
    if (group._count.memberships === 0 && group._count.placeholders === 0) {
      await prisma.group.delete({ where: { id: group.id } });
      console.log(`Deleted empty group: ${group.name}`);
      deleted++;
    }
  }

  console.log(`Successfully deleted ${deleted} empty ghost groups.`);

  // Renumber remaining groups
  const offerings = await prisma.courseOffering.findMany({
    include: { groups: { orderBy: { createdAt: 'asc' } } }
  });

  for (const offering of offerings) {
    let number = 1;
    for (const g of offering.groups) {
      if (/^Group \d+/.test(g.name)) {
         await prisma.group.update({
            where: { id: g.id },
            data: { name: `Group ${number}` }
         });
         number++;
      }
    }
  }
  console.log("Renumbered remaining standard groups to ensure sequence is correct.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
