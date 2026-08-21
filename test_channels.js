const fs = require('fs');
const content = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('const INBOX_CHANNELS = ['));
console.log(start);
