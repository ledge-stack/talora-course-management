import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const offering = await prisma.courseOffering.findFirst({
    include: {
      class: true
    }
  });

  if (!offering) {
    console.log('No offering found. Run seed.ts first.');
    return;
  }

  const offeringId = offering.id;

  // Clear existing events for this offering
  await prisma.timetableEvent.deleteMany({
    where: { offeringId }
  });

  const events = [
    // Monday (dayOfWeek = 1)
    { dayOfWeek: 1, startTime: '12:00', endTime: '16:00', title: 'CSC 2114 Artificial Intelligence (Rose Nakibuule)', location: 'LLT 5B' },
    // Tuesday (dayOfWeek = 2)
    { dayOfWeek: 2, startTime: '12:00', endTime: '14:00', title: 'CSC 2105 Discrete Mathematics (John Kizito)', location: 'LLT 1B' },
    // Wednesday (dayOfWeek = 3)
    { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', title: 'BSE 2106 Computer Networks (Julianne Sansa-Otim)', location: 'LLT 5A' },
    { dayOfWeek: 3, startTime: '11:00', endTime: '12:00', title: 'CSC 2105 Discrete Mathematics (John Kizito)', location: 'LLT 2C' },
    // Thursday (dayOfWeek = 4)
    { dayOfWeek: 4, startTime: '11:00', endTime: '13:00', title: 'CSC 2107 Database Management Systems (Emmanuel Lule)', location: 'LLT 4A' },
    { dayOfWeek: 4, startTime: '14:00', endTime: '16:00', title: 'CSC 2118 Embedded and Real-time Systems (Mary Nsabagwa)', location: 'Hi-Train-Lab' },
    // Friday (dayOfWeek = 5)
    { dayOfWeek: 5, startTime: '10:00', endTime: '12:00', title: 'BSE 2106 Computer Networks (Tonny Bulega)', location: 'Lab 1' },
    { dayOfWeek: 5, startTime: '12:00', endTime: '14:00', title: 'CSC 2107 Database Management Systems (Emmanuel Lule)', location: 'LLT 6A' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '16:00', title: 'CSC 2118 Embedded and Real-time Systems (Mary Nsabagwa)', location: 'Hi-Train-Lab' },
  ];

  for (const event of events) {
    await prisma.timetableEvent.create({
      data: {
        ...event,
        offeringId
      }
    });
  }

  console.log(`Seeded ${events.length} timetable events for offering: ${offering.class.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
