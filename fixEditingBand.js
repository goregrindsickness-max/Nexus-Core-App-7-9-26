import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/editingBand\.logo_url/g, 'editingBand?.logo_url');
fs.writeFileSync('src/App.tsx', content);
