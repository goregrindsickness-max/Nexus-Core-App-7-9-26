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

  // Find all instances where we injected a try catch without the closing parens for the inner call
  // Specifically: (function(){try{localStorage.setItem($1, $2;}catch(e){}})());
  // where $2 should have ended with )
  
  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?);\s*\}catch\(e\)\{\}\}\)\(\);/g, '(function(){try{localStorage.setItem($1, $2);}catch(e){}})();');
  
  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?)\s*\}catch\(e\)\{\}\}\)\(\);/g, '(function(){try{localStorage.setItem($1, $2);}catch(e){}})();');


  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Syntax fixed ${file}`);
  }
});
