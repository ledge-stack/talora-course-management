const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanSystem() {
  try {
    const keepEmails = ['admin@talora.com', 'leonnsitta@gmail.com'];
    
    console.log(`Starting system cleanup. Keeping users with emails: ${keepEmails.join(', ')}`);

    // 1. Delete all groups (this cascades down to memberships and requests)
    const groupsDeleted = await prisma.group.deleteMany({});
    console.log(`Deleted ${groupsDeleted.count} groups (and their memberships/requests).`);

    // 2. Delete all enrollments
    const enrollmentsDeleted = await prisma.enrollment.deleteMany({});
    console.log(`Deleted ${enrollmentsDeleted.count} enrollments.`);

    // 3. Delete all submissions
    const submissionsDeleted = await prisma.submission.deleteMany({});
    console.log(`Deleted ${submissionsDeleted.count} submissions.`);

    // 4. Delete all student issues
    const issuesDeleted = await prisma.issue.deleteMany({});
    console.log(`Deleted ${issuesDeleted.count} issues.`);

    // 5. Delete users (except the two kept)
    const usersDeleted = await prisma.user.deleteMany({
      where: {
        email: {
          notIn: keepEmails
        }
      }
    });
    console.log(`Successfully deleted ${usersDeleted.count} users (and their cascaded relations).`);

    console.log('System is fresh and ready for new use!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSystem();
