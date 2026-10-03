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
  console.log('Connecting to Neon DB...');
  
  // Exclude seed emails
  const seedEmailDomains = ['@capacityconnect.org', '@example.com'];
  
  // Extract custom users
  const allUsers = await prisma.user.findMany({
    include: {
      trainerProfile: true,
      traineeProfile: true,
      userRoles: { include: { role: true } }
    }
  });

  const customUsers = allUsers.filter(u => !seedEmailDomains.some(domain => u.email.includes(domain)));
  console.log(`Found ${customUsers.length} custom user(s).`);

  // Extract custom courses
  const seedCourseTitles = [
    'Introduction to Seismology & Earthquake Monitoring',
    'Advanced Oceanography and Marine Modeling',
    'Atmospheric Physics & Climate Dynamics',
    'Marine Biodiversity & Coastal Zone Management',
    'Advanced Hydrodynamic Modeling (MIKE 21 / Delft3D)',
    'High-Performance Computing for Earth System Modeling',
    'Geographic Information Systems: Advanced Spatial Analysis',
    'Python for Earth Science Data Analysis',
    'Scientific Data Management: NetCDF, HDF5 & Metadata Standards'
  ];

  const allCourses = await prisma.course.findMany({
    include: {
      trainer: {
        include: { user: true }
      },
      category: true,
      modules: true,
      courseSkills: { include: { skill: true } }
    }
  });

  const customCourses = allCourses.filter(c => !seedCourseTitles.includes(c.title));
  console.log(`Found ${customCourses.length} custom course(s).`);

  const backupData = {
    users: customUsers,
    courses: customCourses,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('neon_backup.json', JSON.stringify(backupData, null, 2));
  console.log('Successfully backed up custom courses and users to neon_backup.json');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
