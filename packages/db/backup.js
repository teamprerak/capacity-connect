const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: {
      trainer: {
        include: {
          user: true
        }
      },
      category: true,
      modules: true,
      skills: {
        include: { skill: true }
      }
    }
  });

  const users = await prisma.user.findMany({
    include: {
      trainerProfile: true,
      traineeProfile: true
    }
  });

  const fs = require('fs');
  fs.writeFileSync('db_backup.json', JSON.stringify({ courses, users }, null, 2));
  console.log(`Exported ${courses.length} courses and ${users.length} users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
