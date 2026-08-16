import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching CS-2 offering...');
  const offering = await prisma.courseOffering.findFirst({
    where: {
      class: { name: 'CS-2' }
    },
    include: {
      unit: true
    }
  });

  if (!offering) {
    console.log('Could not find CS-2 offering. Aborting.');
    return;
  }
  
  const classId = offering.classId;
  const termId = offering.termId;

  console.log('Clearing existing timetable events for CS-2 class...');
  
  // Find all offerings for CS-2 in this term
  const offeringsForClass = await prisma.courseOffering.findMany({
    where: { classId, termId },
    include: { unit: true }
  });

  const offeringIds = offeringsForClass.map(o => o.id);

  await prisma.timetableEvent.deleteMany({
    where: {
      offeringId: { in: offeringIds }
    }
  });

  console.log('Creating/Updating Course Units and Offerings...');

  const units = [
    { code: 'BSE 2106', title: 'Computer Networks', lecturerName: 'Julianne Sansa-Otim & Tonny Bulega' },
    { code: 'CSC 2105', title: 'Discrete Mathematics', lecturerName: 'John Kizito' },
    { code: 'CSC 2114', title: 'Artificial Intelligence', lecturerName: 'Rose Nakibuule' },
    { code: 'CSC 2107', title: 'Database Management Systems', lecturerName: 'Emmanuel Lule' },
    { code: 'CSC 2118', title: 'Embedded and Real-time Systems', lecturerName: 'Mary Nsabagwa' },
  ];

  const offeringMap: Record<string, string> = {};

  for (const u of units) {
    // Upsert the unit
    const unit = await prisma.courseUnit.upsert({
      where: { code: u.code },
      update: { title: u.title, lecturerName: u.lecturerName },
      create: { code: u.code, title: u.title, lecturerName: u.lecturerName, institutionId: offering.institutionId }
    });

    // Ensure there's an offering for this class + term
    let off = await prisma.courseOffering.findFirst({
      where: { unitId: unit.id, classId, termId }
    });

    if (!off) {
      off = await prisma.courseOffering.create({
        data: {
          unitId: unit.id,
          classId,
          termId,
          minGroupSize: 4,
          maxGroupSize: 6,
        }
      });
    }

    offeringMap[u.code] = off.id;
  }

  console.log('Creating Timetable Events...');

  const events = [
    // BSE 2106
    { code: 'BSE 2106', title: 'BSE 2106 Lecture', dayOfWeek: 3, startTime: '08:00', endTime: '10:00', location: 'LLT 5A' },
    { code: 'BSE 2106', title: 'BSE 2106 Lab', dayOfWeek: 5, startTime: '10:00', endTime: '12:00', location: 'Lab 1' },
    // CSC 2105
    { code: 'CSC 2105', title: 'CSC 2105 Lecture', dayOfWeek: 2, startTime: '12:00', endTime: '14:00', location: 'LLT 1B' },
    { code: 'CSC 2105', title: 'CSC 2105 Tutorial', dayOfWeek: 3, startTime: '11:00', endTime: '12:00', location: 'LLT 2C' },
    // CSC 2114
    { code: 'CSC 2114', title: 'CSC 2114 Lecture', dayOfWeek: 1, startTime: '12:00', endTime: '16:00', location: 'LLT 5B' },
    // CSC 2107
    { code: 'CSC 2107', title: 'CSC 2107 Lecture', dayOfWeek: 4, startTime: '11:00', endTime: '13:00', location: 'LLT 4A' },
    { code: 'CSC 2107', title: 'CSC 2107 Tutorial', dayOfWeek: 5, startTime: '12:00', endTime: '14:00', location: 'LLT 6A' },
    // CSC 2118
    { code: 'CSC 2118', title: 'CSC 2118 Lab', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', location: 'Hi-Train-Lab' },
    { code: 'CSC 2118', title: 'CSC 2118 Lab', dayOfWeek: 5, startTime: '14:00', endTime: '16:00', location: 'Hi-Train-Lab' },
  ];

  for (const ev of events) {
    await prisma.timetableEvent.create({
      data: {
        offeringId: offeringMap[ev.code],
        title: ev.title,
        dayOfWeek: ev.dayOfWeek,
        startTime: ev.startTime,
        endTime: ev.endTime,
        location: ev.location,
      }
    });
  }

  console.log('Timetable successfully populated!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
