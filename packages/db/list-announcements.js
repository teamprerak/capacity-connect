const { PrismaClient } = require('./generated/client/index.js');
const prisma = new PrismaClient();

async function main() {
  const announcements = await prisma.announcement.findMany();
  console.log('Announcements:', announcements);
}
main().catch(console.error).finally(() => prisma.$disconnect());
