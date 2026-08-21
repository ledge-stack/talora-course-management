import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function test() {
  try {
    const adminUser = await db.user.findFirst({
      where: { email: 'admin@talora.com' },
      include: { roles: true }
    });

    if (!adminUser) {
      console.log('Admin not found');
      return;
    }
    
    console.log('Admin institutionId:', adminUser.institutionId);

    let whereClause = {
      institutionId: adminUser.institutionId,
    };

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        roles: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('Users found:', users.length);
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await db.$disconnect();
  }
}

test();
