import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/title="Upcoming Calendar"/g, 'title="Upcoming Show Calendar"');
content = content.replace(/title="Core Packing Checklist"/g, 'title="Core Checklist"');

fs.writeFileSync('src/App.tsx', content);
