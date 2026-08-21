const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf-8');
content = content.replace(/\.catch\(console\.error\)/g, '.catch((e) => console.error(e))');
fs.writeFileSync('src/components/LabelDashboardViewV2.tsx', content);
