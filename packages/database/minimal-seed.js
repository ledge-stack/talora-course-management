const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inserting minimal setup data...');
  const institution = await prisma.institution.create({
    data: { name: 'Global Tech University', code: 'UNI-001' },
  });
  
  const term = await prisma.academicTerm.create({
    data: {
      institutionId: institution.id,
      name: 'Semester 1',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      isCurrent: true,
    },
  });

  const classCohort = await prisma.classCohort.create({
    data: { name: 'CS-2', year: 2024 },
  });

  const unit = await prisma.courseUnit.create({
    data: { code: 'CSC 2114', title: 'Artificial Intelligence', lecturerName: 'Rose Nakibuule', lecturerEmail: 'rnakibuule@gtu.edu', lecturerPhone: '+256 700 000001' }
  });

  await prisma.courseOffering.create({
    data: {
      unitId: unit.id,
      termId: term.id,
      classId: classCohort.id,
      minGroupSize: 4,
      maxGroupSize: 6,
    },
  });

  console.log('Minimal seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
