import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');
content = content.replace(/prev\.map\(b => b\.id/g, 'prev.map(b => b?.id');
fs.writeFileSync('src/components/SettingsView.tsx', content);
