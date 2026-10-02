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
  // Emerald
  [/bg-emerald-500\/10\s+text-emerald-400\s+border-emerald-500\/[23]0/g, 'bg-emerald-100 text-emerald-700 border-emerald-200'],
  [/text-emerald-400\s+bg-emerald-500\/10/g, 'text-emerald-700 bg-emerald-100'],
  [/text-emerald-400\s+border-emerald-500\/20/g, 'text-emerald-700 border-emerald-200'],
  [/hover:bg-emerald-500\/20/g, 'hover:bg-emerald-200'],
  [/bg-emerald-500\/10/g, 'bg-emerald-100'],
  [/text-emerald-400/g, 'text-emerald-700'],

  // Rose
  [/bg-rose-500\/10\s+text-rose-400\s+border-rose-500\/20/g, 'bg-rose-100 text-rose-700 border-rose-200'],
  [/text-rose-400\s+bg-rose-500\/10/g, 'text-rose-700 bg-rose-100'],
  [/hover:bg-rose-500\/20/g, 'hover:bg-rose-200'],
  [/bg-rose-500\/10/g, 'bg-rose-100'],
  [/text-rose-400/g, 'text-rose-700'],

  // Amber
  [/bg-amber-500\/10\s+text-amber-400\s+border-amber-500\/20/g, 'bg-amber-100 text-amber-700 border-amber-200'],
  [/text-amber-400\s+bg-amber-500\/10/g, 'text-amber-700 bg-amber-100'],
  [/hover:bg-amber-500\/20/g, 'hover:bg-amber-200'],
  [/bg-amber-500\/10/g, 'bg-amber-100'],
  [/text-amber-400/g, 'text-amber-700'],
  [/text-amber-300/g, 'text-amber-700'], // text-amber-300 in alerts

  // Slate
  [/bg-slate-500\/10\s+text-muted-foreground\s+border-slate-500\/20/g, 'bg-slate-100 text-slate-700 border-slate-200'],
  [/bg-slate-500\/10\s+text-slate-400\s+border-slate-500\/20/g, 'bg-slate-100 text-slate-700 border-slate-200'],
  [/hover:bg-slate-500\/20/g, 'hover:bg-slate-200'],
  [/bg-slate-500\/10/g, 'bg-slate-100'],

  // Indigo
  [/bg-indigo-500\/10\s+text-indigo-400\s+border-indigo-500\/20/g, 'bg-indigo-100 text-indigo-700 border-indigo-200'],
  [/hover:bg-indigo-500\/20/g, 'hover:bg-indigo-200'],
  [/bg-indigo-500\/10/g, 'bg-indigo-100'],
  [/text-indigo-400/g, 'text-indigo-700'],

  // Red
  [/bg-red-500\/10\s+text-red-400\s+border-red-500\/20/g, 'bg-red-100 text-red-700 border-red-200'],
  [/hover:bg-red-500\/20/g, 'hover:bg-red-200'],
  [/bg-red-500\/10/g, 'bg-red-100'],
  [/text-red-400/g, 'text-red-700'],

  // Purple
  [/bg-purple-500\/10\s+text-purple-400\s+border-purple-500\/20/g, 'bg-purple-100 text-purple-700 border-purple-200'],
  [/hover:bg-purple-500\/20/g, 'hover:bg-purple-200'],
  [/bg-purple-500\/10/g, 'bg-purple-100'],
  [/text-purple-400/g, 'text-purple-700'],
  
  // Blue/Primary issues seen in screenshot/code
  [/bg-primary\/20\s+text-blue-300\s+border-blue-500\/40/g, 'bg-blue-50 text-blue-700 border-blue-200'],
  [/bg-blue-900\/20\s+border-blue-800\/30/g, 'bg-blue-50 border-blue-100'],
  [/bg-emerald-600\/20\s+border-emerald-500\/30\s+text-emerald-400/g, 'bg-emerald-100 border-emerald-200 text-emerald-700'],
  [/hover:bg-emerald-600\/30/g, 'hover:bg-emerald-200'],
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

console.log(`Updated ${changedFiles} files.`);
