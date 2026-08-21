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

const files = walk('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Let's replace any malformed setItem wrappers:
  // e.g. (function(){try{localStorage.setItem('distro_db_announcements', JSON.stringify(updated)));}catch(e){}})();
  
  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?)\s*\}catch\(e\)\{\}\}\)\(\);?/g, function(match, p1, p2) {
    // Strip trailing semicolons or closing parens from p2
    let cleanP2 = p2.replace(/;+$/, '').replace(/\)+$/, '');
    // Some p2s might have been JSON.stringify(var). We need to restore it properly.
    if (cleanP2.startsWith('JSON.stringify(')) {
       // if it starts with JSON.stringify(, it must end with )
       if (!cleanP2.endsWith(')')) cleanP2 = cleanP2 + ')';
    }
    return `(function(){try{localStorage.setItem(${p1}, ${cleanP2});}catch(e){}})();`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Syntax fixed 4 ${file}`);
  }
});
