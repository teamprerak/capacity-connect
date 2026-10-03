const { PrismaClient } = require('./generated/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_qZkEr2xNF8zS@ep-frosty-block-az5zpzcx-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  console.log('Connecting to Neon DB for restore...');
  
  const backupData = JSON.parse(fs.readFileSync('neon_backup.json', 'utf8'));
  
  console.log(`Loaded ${backupData.users.length} users and ${backupData.courses.length} courses from backup.`);

  // 1. Fetch fresh roles and categories from the newly seeded DB
  const freshRoles = await prisma.role.findMany();
  const freshCategories = await prisma.courseCategory.findMany();

  // 2. Restore Users
  for (const u of backupData.users) {
    const { trainerProfile, traineeProfile, userRoles, ...userData } = u;
    
    // Check if user already exists (just in case)
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existing) {
      console.log(`User ${userData.email} already exists, skipping user creation.`);
      continue;
    }

    // Prepare roles mapping
    const mappedRoles = userRoles.map(ur => {
      const newRole = freshRoles.find(r => r.name === ur.role.name);
      return { roleId: newRole.id };
    });

    await prisma.user.create({
      data: {
        ...userData,
        userRoles: {
          create: mappedRoles
        },
        ...(trainerProfile ? { trainerProfile: { create: { ...trainerProfile, userId: undefined, id: undefined, departmentId: undefined } } } : {}),
        ...(traineeProfile ? { traineeProfile: { create: { ...traineeProfile, userId: undefined, id: undefined, departmentId: undefined } } } : {})
      }
    });
    console.log(`Restored user: ${userData.email}`);
  }

  // 3. Restore Courses
  for (const c of backupData.courses) {
    const { category, trainer, modules, courseSkills, id, createdAt, updatedAt, ...courseData } = c;

    // Resolve new category ID by name
    let newCategoryId = courseData.categoryId;
    if (category) {
      const freshCat = freshCategories.find(fc => fc.name === category.name);
      if (freshCat) newCategoryId = freshCat.id;
    }

    // Resolve new trainer ID by email (since trainer UUID might have changed)
    let newTrainerId = courseData.trainerId;
    if (trainer && trainer.user) {
      const trainerUser = await prisma.user.findUnique({ where: { email: trainer.user.email }, include: { trainerProfile: true } });
      if (trainerUser && trainerUser.trainerProfile) {
        newTrainerId = trainerUser.trainerProfile.id;
      }
    }

    // Check if course exists
    const existingCourse = await prisma.course.findFirst({ where: { title: courseData.title } });
    if (existingCourse) {
      console.log(`Course '${courseData.title}' already exists, skipping.`);
      continue;
    }

    await prisma.course.create({
      data: {
        ...courseData,
        categoryId: newCategoryId,
        trainerId: newTrainerId,
        modules: {
          create: modules.map(m => ({ ...m, courseId: undefined, id: undefined }))
        }
      }
    });
    console.log(`Restored course: ${courseData.title}`);
  }

  console.log('Restore complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
