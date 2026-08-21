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

  // Replace localStorage.getItem
  content = content.replace(/localStorage\.getItem\((.*?)\)/g, '(function(){try{return localStorage.getItem($1);}catch(e){return null;}})()');
  
  // Replace localStorage.setItem
  content = content.replace(/localStorage\.setItem\((.*?),\s*(.*?)\)/g, '(function(){try{localStorage.setItem($1, $2);}catch(e){}})()');
  
  // Replace localStorage.removeItem
  content = content.replace(/localStorage\.removeItem\((.*?)\)/g, '(function(){try{localStorage.removeItem($1);}catch(e){}})()');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
});
