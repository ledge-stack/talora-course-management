import { PrismaClient, RoleType, GroupStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  // Clear existing data due to cascading relations (run this with caution in production)
  await prisma.notification.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.timetableEvent.deleteMany({});
  await prisma.groupChangeRequest.deleteMany({});
  await prisma.groupMembership.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.courseOffering.deleteMany({});
  await prisma.classCohort.deleteMany({});
  await prisma.academicTerm.deleteMany({});
  await prisma.courseUnit.deleteMany({});
  await prisma.institution.deleteMany({});
  
  console.log('Seeding database...');

  // Create Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'Global Tech University',
      code: 'UNI-001',
    },
  });

  // Create Term
  const term = await prisma.academicTerm.create({
    data: {
      institutionId: institution.id,
      name: 'Semester 1',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      isCurrent: true,
    },
  });

  // Create Class Cohort
  const classCohort = await prisma.classCohort.create({
    data: {
      name: 'CS-2',
      year: 2024,
    },
  });

  // Create Course Units
  const unitsData = [
    { code: 'CSC 2114', title: 'Artificial Intelligence', lecturerName: 'Rose Nakibuule', lecturerEmail: 'rnakibuule@gtu.edu', lecturerPhone: '+256 700 000001' },
    { code: 'CSC 2105', title: 'Discrete Mathematics', lecturerName: 'John Kizito', lecturerEmail: 'jkizito@gtu.edu', lecturerPhone: '+256 700 000002' },
    { code: 'BSE 2106', title: 'Computer Networks', lecturerName: 'Tonny Bulega', lecturerEmail: 'tbulega@gtu.edu', lecturerPhone: '+256 700 000003' },
    { code: 'CSC 2107', title: 'Database Management Systems', lecturerName: 'Emmanuel Lule', lecturerEmail: 'elule@gtu.edu', lecturerPhone: '+256 700 000004' },
    { code: 'CSC 2118', title: 'Embedded and Real-time Systems', lecturerName: 'Mary Nsabagwa', lecturerEmail: 'mnsabagwa@gtu.edu', lecturerPhone: '+256 700 000005' },
  ];

  const offerings = [];
  for (const u of unitsData) {
    const unit = await prisma.courseUnit.create({
      data: u
    });

    const offering = await prisma.courseOffering.create({
      data: {
        unitId: unit.id,
        termId: term.id,
        classId: classCohort.id,
        minGroupSize: 4,
        maxGroupSize: 6,
      },
    });
    offerings.push(offering);
  }

  // Use the first offering as the "Primary" one for some group tasks
  const primaryOffering = offerings[0];

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // Create Admin User
  await prisma.user.create({
    data: {
      institutionId: institution.id,
      email: 'admin@university.edu',
      fullName: 'System Administrator',
      passwordHash: defaultPassword,
      roles: {
        create: { role: RoleType.PLATFORM_ADMIN },
      },
    },
  });

  // Create Class Rep User
  const rep = await prisma.user.create({
    data: {
      institutionId: institution.id,
      email: 'rep@university.edu',
      fullName: 'Jane Doe',
      studentNumber: '2500710000',
      registrationNumber: '25/U/10000',
      passwordHash: defaultPassword,
      roles: {
        create: [
          { role: RoleType.CLASS_REPRESENTATIVE, classId: classCohort.id },
          { role: RoleType.STUDENT }
        ],
      },
      enrollments: {
        create: offerings.map(o => ({ offeringId: o.id }))
      },
    },
  });

  // Create Student / Group Leader User
  const leader = await prisma.user.create({
    data: {
      institutionId: institution.id,
      email: 'leader@university.edu',
      fullName: 'Sarah Chen',
      studentNumber: '2500712345',
      registrationNumber: '25/U/12345',
      passwordHash: defaultPassword,
      roles: {
        create: [
          { role: RoleType.STUDENT },
          { role: RoleType.GROUP_LEADER },
        ],
      },
      enrollments: {
        create: offerings.map(o => ({ offeringId: o.id }))
      },
    },
  });

  // Create 20 standard students
  const students = [];
  for (let i = 1; i <= 20; i++) {
    const isOlderYear = i % 5 === 0; // Every 5th student is a retaker (e.g., YY=24)
    const yy = isOlderYear ? '24' : '25';
    
    const s = await prisma.user.create({
      data: {
        institutionId: institution.id,
        email: `student${i}@university.edu`,
        fullName: `Student ${i} FullName`,
        studentNumber: `${yy}00712${345 + i}`,
        registrationNumber: `${yy}/U/12${345 + i}`,
        passwordHash: defaultPassword,
        roles: { create: { role: RoleType.STUDENT } },
        enrollments: { create: offerings.map(o => ({ offeringId: o.id })) },
      }
    });
    students.push(s);
  }

  // The single student account (for login test)
  const studentUser = students[0];
  await prisma.user.update({
    where: { id: studentUser.id },
    data: { email: 'student@university.edu', fullName: 'Mark Liu' }
  });

  // Groups for primary offering
  // Group 1: Complete (6 members)
  await prisma.group.create({
    data: {
      offeringId: primaryOffering.id,
      name: 'Group 1',
      leaderId: leader.id,
      status: GroupStatus.COMPLETE,
      memberships: {
        create: [
          { studentId: leader.id, offeringId: primaryOffering.id },
          { studentId: rep.id, offeringId: primaryOffering.id },
          ...students.slice(1, 5).map(s => ({ studentId: s.id, offeringId: primaryOffering.id }))
        ],
      },
    },
  });

  // Group 2: Incomplete (3 members)
  const group2Leader = students[5];
  await prisma.group.create({
    data: {
      offeringId: primaryOffering.id,
      name: 'Group 2',
      leaderId: group2Leader.id,
      status: GroupStatus.INCOMPLETE,
      memberships: {
        create: [
          ...students.slice(5, 8).map(s => ({ studentId: s.id, offeringId: primaryOffering.id }))
        ],
      },
    },
  });

  // Group 3: Forming (2 members)
  const group3Leader = students[8];
  await prisma.group.create({
    data: {
      offeringId: primaryOffering.id,
      name: 'Group 3',
      leaderId: group3Leader.id,
      status: GroupStatus.FORMING,
      memberships: {
        create: [
          ...students.slice(8, 10).map(s => ({ studentId: s.id, offeringId: primaryOffering.id }))
        ],
      },
    },
  });

  // Group 4: Forming (1 member)
  const group4Leader = students[10];
  await prisma.group.create({
    data: {
      offeringId: primaryOffering.id,
      name: 'Group 4',
      leaderId: group4Leader.id,
      status: GroupStatus.FORMING,
      memberships: {
        create: [
          { studentId: group4Leader.id, offeringId: primaryOffering.id }
        ],
      },
    },
  });

  // Students 11-19 are ungrouped

  // Create Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      offeringId: primaryOffering.id,
      title: 'Assignment 3: Search Algorithms',
      description: 'Implement A* and BFS algorithms for a pathfinding visualizer. Submit your code via GitHub link in a PDF report.',
      type: 'HOMEWORK',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
    },
  });

  await prisma.assignment.create({
    data: {
      offeringId: primaryOffering.id,
      title: 'Final AI Project',
      description: 'Train a deep learning model to classify images using PyTorch. Submission must include model weights and a 4-page report.',
      type: 'PROJECT',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Due in 14 days
    },
  });

  // Create Submissions (half of the class)
  for (let i = 0; i < 10; i++) {
    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: students[i].id,
        fileUrl: `https://storage.example.com/submission_${students[i].id}.pdf`,
      }
    });
  }

  // Create Announcements
  await prisma.announcement.create({
    data: {
      offeringId: primaryOffering.id,
      authorId: rep.id,
      title: 'Welcome to Semester 1 CS-2!',
      content: 'Please make sure you form your groups by the end of next week. Minimum size is 4 members.',
      tag: 'IMPORTANT',
    }
  });

  await prisma.announcement.create({
    data: {
      offeringId: primaryOffering.id,
      authorId: rep.id,
      title: 'AI Lecture Moved',
      content: 'The lecture on Tuesday has been moved to the afternoon slot. Please check the timetable.',
      tag: 'GENERAL',
    }
  });

  // Create Issues
  await prisma.issue.create({
    data: {
      studentId: studentUser.id,
      offeringId: primaryOffering.id,
      title: 'Lab 2 computers missing Python 3.10',
      description: 'The computers in the east wing lab do not have the required software installed for our AI practicals.',
      status: 'OPEN',
      category: 'RESOURCES',
    }
  });

  await prisma.issue.create({
    data: {
      studentId: students[12].id,
      offeringId: primaryOffering.id,
      title: 'Project Group 4 needs one more member',
      description: 'We are currently 3 people and need a 4th to meet the minimum requirement. Please let me know if interested.',
      status: 'OPEN',
      category: 'GROUPS',
    }
  });

  await prisma.issue.create({
    data: {
      studentId: leader.id,
      offeringId: primaryOffering.id,
      title: 'Missing Assignment 2 Grades',
      description: 'We submitted assignment 2 last week but grades are not out yet.',
      status: 'IN_PROGRESS',
      category: 'ACADEMIC',
    }
  });

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      { userId: rep.id, title: 'New Issue Reported', message: 'Mark Liu reported an issue: Lab 2 computers...' },
      { userId: rep.id, title: 'Group Size Warning', message: 'Group 2 is below the minimum size.' },
      { userId: leader.id, title: 'Assignment Graded', message: 'Your grade for Assignment 2 is published.' },
      { userId: studentUser.id, title: 'Group Request', message: 'Sarah Chen invited you to join Group 1.' },
    ]
  });

  // Seed Timetable Events directly here so we don't need a separate script
  const events = [
    { dayOfWeek: 1, startTime: '12:00', endTime: '16:00', title: 'CSC 2114 Artificial Intelligence', location: 'LLT 5B', offeringId: offerings[0].id },
    { dayOfWeek: 2, startTime: '12:00', endTime: '14:00', title: 'CSC 2105 Discrete Mathematics', location: 'LLT 1B', offeringId: offerings[1].id },
    { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', title: 'BSE 2106 Computer Networks', location: 'LLT 5A', offeringId: offerings[2].id },
    { dayOfWeek: 3, startTime: '11:00', endTime: '12:00', title: 'CSC 2105 Discrete Mathematics', location: 'LLT 2C', offeringId: offerings[1].id },
    { dayOfWeek: 4, startTime: '11:00', endTime: '13:00', title: 'CSC 2107 Database Management Systems', location: 'LLT 4A', offeringId: offerings[3].id },
    { dayOfWeek: 4, startTime: '14:00', endTime: '16:00', title: 'CSC 2118 Embedded and Real-time Systems', location: 'Hi-Train-Lab', offeringId: offerings[4].id },
    { dayOfWeek: 5, startTime: '10:00', endTime: '12:00', title: 'BSE 2106 Computer Networks', location: 'Lab 1', offeringId: offerings[2].id },
    { dayOfWeek: 5, startTime: '12:00', endTime: '14:00', title: 'CSC 2107 Database Management Systems', location: 'LLT 6A', offeringId: offerings[3].id },
    { dayOfWeek: 5, startTime: '14:00', endTime: '16:00', title: 'CSC 2118 Embedded and Real-time Systems', location: 'Hi-Train-Lab', offeringId: offerings[4].id },
  ];

  await prisma.timetableEvent.createMany({ data: events });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
