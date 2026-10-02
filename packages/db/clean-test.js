const { PrismaClient } = require('./generated/client/index.js');
const prisma = new PrismaClient();

async function main() {
  const deletedNotifs = await prisma.notification.deleteMany({
    where: {
      OR: [
        { title: { contains: 'test', mode: 'insensitive' } },
        { body: { contains: 'test', mode: 'insensitive' } },
      ],
    },
  });
  console.log(`Deleted ${deletedNotifs.count} test notifications.`);

  const deletedAnnouncements = await prisma.announcement.deleteMany({
    where: {
      OR: [
        { title: { contains: 'test', mode: 'insensitive' } },
        { body: { contains: 'test', mode: 'insensitive' } },
      ],
    },
  });
  console.log(`Deleted ${deletedAnnouncements.count} test announcements.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
