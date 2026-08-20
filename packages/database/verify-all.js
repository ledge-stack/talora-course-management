const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const users = await prisma.user.findMany({ where: { isEmailVerified: false } });
  console.log('Unverified users:', users.map(u => u.email));
  for(const user of users) {
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });
    console.log('Verified', user.email);
  }
  await prisma.$disconnect();
}
verify();
