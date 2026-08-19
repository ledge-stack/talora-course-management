const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'leon.nsittakalungi@students.mak.ac.ug';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found!');
    return;
  }

  const classCohort = await prisma.classCohort.findFirst();

  if (!classCohort) {
    console.log('Class Cohort not found!');
    return;
  }

  // Check if role already exists
  const existingRole = await prisma.userRole.findFirst({
    where: { userId: user.id, role: 'CLASS_REPRESENTATIVE' }
  });

  if (!existingRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        role: 'CLASS_REPRESENTATIVE',
        classId: classCohort.id
      }
    });
    console.log(`Successfully upgraded ${email} to CLASS_REPRESENTATIVE for class ${classCohort.name}!`);
  } else {
    console.log('User is already a Class Representative.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
