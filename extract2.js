import fs from 'fs';

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

const countStart = lines.findIndex(l => l.startsWith('const AnimatedCount: React.FC'));
const textEnd = lines.findIndex(l => l.startsWith('const CREATIVE_CORE_SKILLS'));

console.log("Start:", countStart, "End:", textEnd);

const newAppContent = lines.slice(0, countStart).join('\n') + '\n' + lines.slice(textEnd).join('\n');
fs.writeFileSync('src/App.tsx.new', newAppContent);
