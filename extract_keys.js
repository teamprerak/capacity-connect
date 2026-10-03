const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = [
  ...walk('apps/web/app/admin'),
  ...walk('apps/web/app/trainer'),
  ...walk('apps/web/app/trainee')
];

const keys = new Set();
// match t("key") or t('key') or {t("key")}
const regex = /t\([\"']([^\"']+)[\"'](?:,\s*[\"']([^\"']+)[\"'])?\)/g;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    // If it has a fallback (match[2]), we don't strictly need to add it, but let's see
    if (!match[2]) {
      keys.add(match[1]);
    }
  }
});

const existingCommon = JSON.parse(fs.readFileSync('apps/web/public/locales/en/common.json', 'utf8'));

const missingKeys = Array.from(keys).filter(k => !existingCommon[k]);

fs.writeFileSync('missing_keys.json', JSON.stringify(missingKeys, null, 2));
console.log('Missing keys:', missingKeys.length);
