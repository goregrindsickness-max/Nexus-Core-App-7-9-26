const fs = require('fs');
let lines = fs.readFileSync('./src/components/PlansView.tsx', 'utf8').split('\n');
lines = lines.slice(0, 1132);
fs.writeFileSync('./src/components/PlansView.tsx', lines.join('\n'));
