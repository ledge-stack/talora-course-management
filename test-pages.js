const http = require('http');

async function testPages() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const { signJwt } = require('@talora/auth');
  
  // Get an active user
  const user = await prisma.user.findFirst({
    include: { roles: true }
  });
  
  const token = await signJwt({ userId: user.id, roles: user.roles });
  
  const urls = [
    '/',
    '/roster',
    '/assignments',
    '/timetable',
    '/groups'
  ];
  
  for (const path of urls) {
    const res = await fetch('http://localhost:3000' + path, {
      headers: {
        'Cookie': 'talora_token=' + token
      }
    });
    
    const text = await res.text();
    if (text.includes('Application error') || res.status === 500) {
      console.log('Error found on ' + path);
      // Next.js will print the error to the dev server console running in the background.
    } else {
      console.log(path + ' - ' + res.status);
    }
  }
  
  await prisma.$disconnect();
}
testPages().catch(console.error);
