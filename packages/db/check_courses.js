const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://neondb_owner:npg_qZkEr2xNF8zS@ep-frosty-block-az5zpzcx-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' }
  }
});

async function main() {
  const count = await prisma.course.count();
  const courses = await prisma.course.findMany({ select: { title: true, status: true,  } });
  
  console.log('Total courses:', count);
  console.log('First 10 courses:', courses.slice(0, 10));
  
  const publishedCount = courses.filter(c => c.status === 'published' || c.status === 'approved' || c.isPublished).length;
  console.log('Published courses:', publishedCount);
}

main().finally(() => prisma.$disconnect());
