const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const institution = await prisma.institution.findFirst();
    if (!institution) {
      console.log('No institution found. Cannot create admin.');
      return;
    }

    const email = 'admin@talora.com';
    const passwordHash = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        fullName: 'Talora Admin',
        institutionId: institution.id,
        isEmailVerified: true,
        isActive: true,
        roles: {
          create: {
            role: 'PLATFORM_ADMIN'
          }
        }
      }
    });

    console.log(`Admin account created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: admin123`);

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
