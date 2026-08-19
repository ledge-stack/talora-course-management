const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const offerings = await prisma.courseOffering.findMany({
    include: { unit: true }
  });

  if (offerings.length === 0) {
    console.log("No course offerings found.");
    return;
  }

  console.log(`Found ${offerings.length} offerings. Seeding timetable events...`);

  // We'll create some realistic looking events for the first few offerings
  const days = [1, 2, 3, 4, 5]; // Mon - Fri
  const startTimes = ['08:00', '10:00', '13:00', '15:00'];
  const endTimes = ['10:00', '12:00', '15:00', '17:00'];
  const locations = ['Room A101', 'Room B202', 'Lecture Hall 1', 'Lab 3', 'Online'];

  let eventCount = 0;

  for (let i = 0; i < offerings.length; i++) {
    const offering = offerings[i];
    
    // Create 2-3 events per offering
    const numEvents = Math.floor(Math.random() * 2) + 2;
    
    for (let e = 0; e < numEvents; e++) {
      const day = days[Math.floor(Math.random() * days.length)];
      const timeIndex = Math.floor(Math.random() * startTimes.length);
      const loc = locations[Math.floor(Math.random() * locations.length)];
      
      const isLecture = Math.random() > 0.3;
      
      await prisma.timetableEvent.create({
        data: {
          offeringId: offering.id,
          title: isLecture ? 'Lecture' : 'Tutorial / Lab',
          dayOfWeek: day,
          startTime: startTimes[timeIndex],
          endTime: endTimes[timeIndex],
          location: loc
        }
      });
      eventCount++;
    }
  }

  console.log(`Seeded ${eventCount} timetable events!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
