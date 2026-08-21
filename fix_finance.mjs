import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("{{dashboardV2ActiveNav === 'FINANCE' && (", "{dashboardV2ActiveNav === 'FINANCE' && (");
code = code.replace("/>\n)}}", "/>\n)}");
fs.writeFileSync('src/App.tsx', code);
