import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const rep = await prisma.user.upsert({
    where: { email: 'rep@university.edu' },
    update: {},
    create: {
      studentId: '2500700001',
      fullName: 'Class Representative',
      email: 'rep@university.edu',
      password,
      phoneNumber: '0700000001',
      registrationNumber: '25/U/00001',
      isEmailVerified: true,
      role: UserRole.CLASS_REP,
    },
  });

  const studentA = await prisma.user.upsert({
    where: { email: 'studentA@university.edu' },
    update: {},
    create: {
      studentId: '2500700002',
      fullName: 'Student Alpha',
      email: 'studentA@university.edu',
      password,
      phoneNumber: '0700000002',
      registrationNumber: '25/U/00002',
      isEmailVerified: true,
      role: UserRole.STUDENT,
    },
  });

  const studentB = await prisma.user.upsert({
    where: { email: 'studentB@university.edu' },
    update: {},
    create: {
      studentId: '2500700003',
      fullName: 'Student Beta',
      email: 'studentB@university.edu',
      password,
      phoneNumber: '0700000003',
      registrationNumber: '25/U/00003',
      isEmailVerified: true,
      role: UserRole.STUDENT,
    },
  });

  // 2. Create Course Units
  const course = await prisma.courseUnit.upsert({
    where: { code: 'CS202' },
    update: {},
    create: {
      code: 'CS202',
      title: 'Distributed Systems',
      minGroupSize: 2,
      maxGroupSize: 4,
      allowsSwaps: true,
    },
  });

  // 3. Create Groups
  const group1 = await prisma.group.create({
    data: {
      courseUnitId: course.id,
      groupNumber: 1,
      leaderId: studentA.id,
      memberships: {
        create: { userId: studentA.id },
      },
    },
  });

  const group2 = await prisma.group.create({
    data: {
      courseUnitId: course.id,
      groupNumber: 2,
      leaderId: studentB.id,
      memberships: {
        create: { userId: studentB.id },
      },
    },
  });

  console.log('Seed data created:');
  console.log({ rep, studentA, studentB, course, group1, group2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
