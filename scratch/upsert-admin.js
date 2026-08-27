const { PrismaClient, RoleType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to database...");
  const email = 'admin@university.edu';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // We need an institution id
  let institution = await prisma.institution.findFirst();
  if (!institution) {
    institution = await prisma.institution.create({
      data: { name: 'Global Tech University', code: 'UNI-001' }
    });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      phoneNumber: '+256700000000',
      acceptedTerms: true,
      isEmailVerified: true,
      passwordHash,
    },
    create: {
      institutionId: institution.id,
      email,
      fullName: 'System Administrator',
      passwordHash,
      phoneNumber: '+256700000000',
      acceptedTerms: true,
      isEmailVerified: true,
    }
  });

  // Assign all roles
  const roles = [RoleType.PLATFORM_ADMIN, RoleType.CLASS_REPRESENTATIVE, RoleType.GROUP_LEADER, RoleType.STUDENT];
  
  for (const role of roles) {
    const existing = await prisma.userRole.findFirst({
      where: { userId: user.id, role }
    });
    if (!existing) {
      await prisma.userRole.create({
        data: { userId: user.id, role }
      });
    }
  }

  console.log('Admin account successfully created/updated!');
  console.log('Email:', user.email);
  console.log('Phone:', user.phoneNumber);
  console.log('Roles: PLATFORM_ADMIN, CLASS_REPRESENTATIVE, GROUP_LEADER, STUDENT');
}

main()
  .catch(e => {
    console.error("Database connection failed:");
    console.error(e);
  })
  .finally(() => prisma.$disconnect());
