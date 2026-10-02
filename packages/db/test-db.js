const { PrismaClient } = require('./generated/client/index.js');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({});
  console.log('Total users:', users.length);
  const activeUsers = await prisma.user.findMany({ where: { status: 'active' } });
  console.log('Active users:', activeUsers.length);
  const notifs = await prisma.notification.findMany({});
  console.log('Total notifications:', notifs.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
