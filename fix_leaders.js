const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.group.findMany({
    include: {
      memberships: true
    }
  });

  let updated = 0;
  for (const group of groups) {
    // Is the leader actually in the group?
    const leaderInGroup = group.memberships.find(m => m.studentId === group.leaderId);
    
    if (!leaderInGroup && group.memberships.length > 0) {
      // Leader is NOT in the group, but there are members!
      // Promote the first member to leader
      const newLeader = group.memberships[0].studentId;
      await prisma.group.update({
        where: { id: group.id },
        data: { leaderId: newLeader }
      });
      console.log(`Promoted student ${newLeader} to leader of ${group.name}`);
      updated++;
    } else if (!leaderInGroup && group.memberships.length === 0) {
       // Group is empty, but leader is not in group? Wait, empty groups have 0 members.
       // We can't really assign a new leader, but the UI might still show the creator.
       // We'll just leave it since there's no one to promote.
       console.log(`Group ${group.name} is empty. Leaving leaderId as is (will be replaced when someone joins).`);
    }
  }

  console.log(`Updated ${updated} groups with missing leaders.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
