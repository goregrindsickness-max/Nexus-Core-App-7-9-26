const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.lstatSync(fullPath);
    if (file.toLowerCase().includes('suffocation') || file.toLowerCase().includes('waste')) {
      console.log(`FOUND: ${fullPath} (${stat.size} bytes)`);
    }
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      findFiles(fullPath);
    }
  });
}

findFiles('.');
