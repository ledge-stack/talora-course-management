const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const EMAIL = 'sessangafaith@gmail.com';

  // 1. Find the user
  const user = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { roles: { include: { class: true } } }
  });

  if (!user) {
    console.log('USER NOT FOUND:', EMAIL);
    return;
  }

  console.log('=== BEFORE FIX ===');
  console.log('Name:', user.fullName);
  console.log('Phone:', user.phoneNumber);
  console.log('acceptedTerms:', user.acceptedTerms);
  console.log('isActive:', user.isActive);
  console.log('Roles:');
  user.roles.forEach(r => {
    console.log('  role=' + r.role + ' classId=' + r.classId + ' class=' + (r.class ? r.class.name : 'NONE'));
  });

  // 2. Fix acceptedTerms if false
  if (!user.acceptedTerms) {
    await prisma.user.update({
      where: { id: user.id },
      data: { acceptedTerms: true }
    });
    console.log('\n[FIX] Set acceptedTerms = true');
  } else {
    console.log('\n[OK] acceptedTerms already true');
  }

  // 3. Find the correct class cohort
  const classes = await prisma.classCohort.findMany();
  console.log('\nAvailable classes:');
  classes.forEach(c => console.log('  id=' + c.id + ' name=' + c.name + ' year=' + c.year));

  // 4. Fix CLASS_REPRESENTATIVE role classId if missing
  const repRole = user.roles.find(r => r.role === 'CLASS_REPRESENTATIVE');
  if (repRole && !repRole.classId) {
    // Assign to the first/most recent class cohort
    const targetClass = classes.sort((a, b) => b.year - a.year)[0];
    if (targetClass) {
      await prisma.userRole.update({
        where: { id: repRole.id },
        data: { classId: targetClass.id }
      });
      console.log('\n[FIX] Assigned classId=' + targetClass.id + ' (' + targetClass.name + ') to CLASS_REPRESENTATIVE role');
    } else {
      console.log('\n[WARN] No class cohort found to assign!');
    }
  } else if (repRole && repRole.classId) {
    console.log('[OK] CLASS_REPRESENTATIVE already has classId=' + repRole.classId);
  } else {
    console.log('[INFO] No CLASS_REPRESENTATIVE role found — she may be a STUDENT only');
  }

  // 5. Final state
  const updated = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { roles: { include: { class: true } } }
  });
  console.log('\n=== AFTER FIX ===');
  console.log('acceptedTerms:', updated.acceptedTerms);
  updated.roles.forEach(r => {
    console.log('  role=' + r.role + ' classId=' + r.classId + ' class=' + (r.class ? r.class.name : 'NONE'));
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
