const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('apps/web/app').concat(walk('apps/web/components'));

const replacements = [
  [/border-emerald-500\/20/g, 'border-emerald-200'],
  [/border-emerald-500\/30/g, 'border-emerald-200'],
  
  [/border-amber-500\/20/g, 'border-amber-200'],
  [/border-amber-500\/30/g, 'border-amber-200'],
  
  [/border-rose-500\/20/g, 'border-rose-200'],
  [/border-rose-500\/30/g, 'border-rose-200'],

  [/border-red-500\/20/g, 'border-red-200'],
  [/border-red-500\/30/g, 'border-red-200'],

  [/border-indigo-500\/20/g, 'border-indigo-200'],
  [/border-indigo-500\/30/g, 'border-indigo-200'],

  [/border-purple-500\/20/g, 'border-purple-200'],
  [/border-purple-500\/30/g, 'border-purple-200'],
  
  [/border-slate-500\/20/g, 'border-slate-200'],
  [/border-slate-500\/30/g, 'border-slate-200'],
];

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(([regex, replaceValue]) => {
    newContent = newContent.replace(regex, replaceValue);
  });
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log(`Updated borders in ${changedFiles} files.`);
