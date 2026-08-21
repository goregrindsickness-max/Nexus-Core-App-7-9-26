import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/b\.logo_url/g, 'b?.logo_url');
content = content.replace(/b\.name/g, 'b?.name');
content = content.replace(/b\.genre/g, 'b?.genre');
fs.writeFileSync('src/App.tsx', content);
