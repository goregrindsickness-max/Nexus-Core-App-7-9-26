import fs from 'fs';
import path from 'path';

console.log('=== Listing files in . ===');
try {
  const files = fs.readdirSync('.');
  for (const f of files) {
    console.log('-', f, fs.statSync(f).isDirectory() ? '(dir)' : '(file)');
  }
} catch (e: any) {
  console.error(e.message);
}

console.log('=== Checking for specific names in . ===');
try {
  const files = fs.readdirSync('.');
  for (const f of files) {
    if (f.includes('\\') || f.toLowerCase().includes('heinous') || f.toLowerCase().includes('tdf') || f.toLowerCase().includes('virulent')) {
      console.log('MATCH IN .:', f);
    }
  }
} catch (e: any) {
  console.error(e.message);
}
