process.env.DATABASE_URL = 'postgresql://ccuser:ccpassword@localhost:5433/capacityconnect';  
const { execSync } = require('child_process');  
const name = process.argv[2] || 'init';
execSync(`npx prisma migrate dev --name ${name} --schema=prisma/schema.prisma`, { stdio: 'inherit', env: process.env });
