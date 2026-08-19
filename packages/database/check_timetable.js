const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.timetableEvent.findMany();
  console.log(`Timetable events count: ${events.length}`);
  if (events.length > 0) {
    console.log(events.slice(0, 5));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
