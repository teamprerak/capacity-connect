const fs = require('fs');

const files = [
  'apps/web/app/about/page.tsx',
  'apps/web/app/certificates/verify/[token]/page.tsx',
  'apps/web/app/privacy/page.tsx',
  'apps/web/app/profile/page.tsx',
  'apps/web/app/security/page.tsx',
  'apps/web/app/terms/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove import
  content = content.replace(/import\s+\{\s*Navbar\s*\}\s+from\s+['"]@\/components\/Navbar['"];?\r?\n?/g, '');
  
  // Remove component
  content = content.replace(/\s*<Navbar\s*\/>\r?\n?/g, '');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Cleaned ${file}`);
});
