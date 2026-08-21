const fs = require('fs');
const path = require('path');

const now = Date.now();
const MAX_AGE_MS = 20 * 60 * 1000; // 20 minutes

console.log('Searching for files modified in the last 20 minutes...');

function scan(dir) {
  try {
    const list = fs.readdirSync(dir);
    for (const f of list) {
      if (f === 'node_modules' || f === '.git' || f === 'dist' || f === '.next') continue;
      const full = path.join(dir, f);
      try {
        const stat = fs.statSync(full);
        if (stat.isFile()) {
          const age = now - stat.mtimeMs;
          if (age < MAX_AGE_MS) {
            console.log(`NEW FILE: ${full} (modified ${Math.round(age / 1000 / 60)}m ago, size: ${stat.size} bytes)`);
          }
        } else if (stat.isDirectory()) {
          // Check directory itself
          const age = now - stat.mtimeMs;
          if (age < MAX_AGE_MS) {
            console.log(`NEW DIR: ${full} (modified ${Math.round(age / 1000 / 60)}m ago)`);
          }
          // Recurse unless it's a virtual or system dir in root
          if (dir !== '/' || ['app', 'workspace', 'tmp', 'home', 'www-data-home', 'root'].includes(f)) {
            scan(full);
          }
        }
      } catch (err) {}
    }
  } catch (err) {}
}

scan('/');
console.log('Search complete.');
