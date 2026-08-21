const fs = require('fs');
const path = require('path');

function findFiles(dir) {
  try {
    const list = fs.readdirSync(dir);
    for (const f of list) {
      const full = path.join(dir, f);
      if (f.toLowerCase().includes('heinous') || f.toLowerCase().includes('tdf') || f.toLowerCase().includes('virulent')) {
        console.log('FOUND:', full);
      }
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory() && f !== 'node_modules' && f !== '.git' && f !== 'dist') {
          findFiles(full);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log('Starting deep search...');
findFiles('/');
console.log('Finished deep search.');
