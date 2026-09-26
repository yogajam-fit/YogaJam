const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
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

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('text-foreground-secondary')) {
    content = content.replace(/text-foreground-secondary/g, 'text-text-secondary');
    changed = true;
  }
  if (content.includes('text-foreground/80')) {
    content = content.replace(/text-foreground\/80/g, 'text-text-primary/95');
    changed = true;
  }
  if (content.includes('text-foreground/70')) {
    content = content.replace(/text-foreground\/70/g, 'text-text-secondary');
    changed = true;
  }
  if (content.includes('text-foreground/60')) {
    content = content.replace(/text-foreground\/60/g, 'text-text-secondary');
    changed = true;
  }
  if (content.includes('text-foreground/50')) {
    content = content.replace(/text-foreground\/50/g, 'text-text-muted-accessible');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
});
