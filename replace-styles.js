const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  [/bg-slate-950/g, 'bg-background'],
  [/bg-slate-900\/(50|60|80|90)/g, 'bg-background'],
  [/bg-slate-900/g, 'bg-background'],
  [/bg-slate-800\/(40|50|60|80)/g, 'bg-card'],
  [/bg-slate-800/g, 'bg-card'],
  [/hover:bg-slate-800(\/(40|50))?/g, 'hover:bg-accent'],
  
  // Text
  [/text-white/g, 'text-foreground'],
  [/text-slate-100/g, 'text-foreground'],
  [/text-slate-200/g, 'text-foreground'],
  [/text-slate-300/g, 'text-muted-foreground'],
  [/text-slate-400/g, 'text-muted-foreground'],
  [/text-slate-500/g, 'text-muted-foreground'],
  
  // Borders
  [/border-slate-800\/(60|80)/g, 'border-border'],
  [/border-slate-800/g, 'border-border'],
  [/border-slate-700/g, 'border-border'],
  [/divide-slate-800\/(60|80)/g, 'divide-border'],
  [/divide-slate-800/g, 'divide-border'],
  
  // Radii & Shadows
  [/rounded-3xl/g, 'rounded-xl'],
  [/rounded-2xl/g, 'rounded-lg'],
  [/rounded-xl/g, 'rounded-md'],
  [/shadow-2xl/g, 'shadow-sm'],
  [/shadow-lg/g, 'shadow-sm'],
  
  // Glassmorphism
  [/glass-card-hover/g, 'hover:shadow-md transition-all duration-200'],
  [/glass-card/g, 'bg-card border border-border shadow-sm'],
  [/glass-nav/g, 'bg-background/95 backdrop-blur-sm border-b border-border'],
  [/brand-title/g, 'text-primary font-bold tracking-tight'],
  
  // Primary Buttons (blue to primary)
  [/bg-blue-600/g, 'bg-primary'],
  [/hover:bg-blue-700/g, 'hover:bg-primary/90'],
  [/text-blue-400/g, 'text-primary'],
  [/text-blue-500/g, 'text-primary'],
  [/border-blue-500\/20/g, 'border-primary/20'],
  [/bg-blue-500\/10/g, 'bg-primary/10'],
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
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

const files = walk(path.join(__dirname, 'apps', 'web'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});
