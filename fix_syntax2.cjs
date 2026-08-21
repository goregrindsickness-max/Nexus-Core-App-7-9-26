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

  // Let's just fix any instances where we have too many parentheses or wrong semi-colons
  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?)\)\);\s*\}catch\(e\)\{\}\}\)\(\);/g, '(function(){try{localStorage.setItem($1, $2);}catch(e){}})();');
  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?)\)\);\);\s*\}catch\(e\)\{\}\}\)\(\);/g, '(function(){try{localStorage.setItem($1, $2);}catch(e){}})();');
  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?)\)\);\)\;\s*\}catch\(e\)\{\}\}\)\(\);/g, '(function(){try{localStorage.setItem($1, $2);}catch(e){}})();');
  
  content = content.replace(/\(function\(\)\{try\{localStorage\.setItem\(([^,]+),\s*(.*?)\)\);\)\;\}catch\(e\)\{\}\}\)\(\);/g, '(function(){try{localStorage.setItem($1, $2);}catch(e){}})();');
  
  content = content.replace(/freq\)\);\);/g, 'freq);');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Syntax fixed ${file}`);
  }
});
