const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const timetableCount = await prisma.timetableEvent.count();
  const unitCount = await prisma.courseUnit.count();
  
  console.log(`Timetable Events: ${timetableCount}`);
  console.log(`Course Units (Lecturer Info): ${unitCount}`);
  
  const units = await prisma.courseUnit.findMany({
    select: { title: true, lecturerName: true }
  });
  console.log(units);
  
  await prisma.$disconnect();
}

checkData();
