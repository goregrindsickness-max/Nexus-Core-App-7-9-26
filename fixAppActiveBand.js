import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/activeBand\./g, 'activeBand?.');
fs.writeFileSync('src/App.tsx', content);
