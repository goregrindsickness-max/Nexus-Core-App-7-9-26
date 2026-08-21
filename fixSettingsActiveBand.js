import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
content = content.replace(/activeBand\./g, 'activeBand?.');
fs.writeFileSync('src/components/SettingsView.tsx', content);
