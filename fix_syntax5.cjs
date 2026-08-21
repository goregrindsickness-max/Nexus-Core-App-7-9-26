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

  // Revert all localStorage wrappers
  content = content.replace(/\(function\(\)\{try\{return localStorage\.getItem\((.*?)\);\}catch\(e\)\{return null;\}\}\)\(\)/g, 'localStorage.getItem($1)');
  
  content = content.replace(/\(function\(\)\{try\{localStorage\.removeItem\((.*?)\);\}catch\(e\)\{\}\}\)\(\)/g, 'localStorage.removeItem($1)');

  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?)\s*\}catch\(e\)\{\}\}\)\(\);?/g, function(match, p1, p2) {
    let cleanP2 = p2.replace(/;+$/, '').replace(/\)+$/, '');
    // Some p2s might have been JSON.stringify(var). We need to restore it properly.
    if (cleanP2.startsWith('JSON.stringify(') && !cleanP2.endsWith(')')) {
       cleanP2 = cleanP2 + ')';
    } else if (cleanP2.startsWith('now.toString(') && !cleanP2.endsWith(')')) {
       cleanP2 = cleanP2 + ')';
    } else if (cleanP2.startsWith('profileStore.setItem(') && !cleanP2.endsWith(')')) {
       cleanP2 = cleanP2 + ')';
    } else if (cleanP2.match(/^[a-zA-Z0-9_]+\.toString\($/) ) {
       cleanP2 = cleanP2 + ')';
    }
    // Also if cleanP2 ends with an unmatched parenthesis... it's a mess.
    // Let's just do a bracket counting.
    let open = (cleanP2.match(/\(/g) || []).length;
    let close = (cleanP2.match(/\)/g) || []).length;
    while (open > close) {
      cleanP2 += ')';
      close++;
    }
    
    return `localStorage.setItem(${p1}, ${cleanP2});`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Reverted 5 ${file}`);
  }
});
