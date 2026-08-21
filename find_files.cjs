const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git' || file === 'dist') return;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (file.toLowerCase().includes('heinous') || file.toLowerCase().includes('tdf') || file.toLowerCase().includes('virulent')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

try {
  console.log('Searching for files...');
  const files = walk('.');
  console.log('Found files:', files);
} catch (err) {
  console.error(err);
}
