import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("{{dashboardV2ActiveNav === 'EVENTS' && (", "{dashboardV2ActiveNav === 'EVENTS' && (");
fs.writeFileSync('src/App.tsx', code);
