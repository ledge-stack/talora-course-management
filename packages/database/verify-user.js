const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'leon.nsittakalungi@students.mak.ac.ug' },
      data: { isEmailVerified: true },
    });
    console.log('User verified successfully:', user.email);
  } catch (error) {
    console.error('Failed to verify user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();
