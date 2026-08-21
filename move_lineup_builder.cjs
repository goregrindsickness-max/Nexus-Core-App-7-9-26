const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('Event Lineup Builder'));
const actualStart = startIdx - 4; 
let actualEnd = actualStart;
let divCount = 0;
for (let i = actualStart; i < lines.length; i++) {
  if (lines[i].includes('<div')) divCount += (lines[i].match(/<div/g) || []).length;
  if (lines[i].includes('</div')) divCount -= (lines[i].match(/<\/div/g) || []).length;
  if (divCount === 0 && i > actualStart) {
    actualEnd = i;
    break;
  }
}

const targetIdx = lines.findIndex(l => l.includes('{/* Always Visible Contract Statuses (Booking Staging Zone) */}'));

let block = lines.slice(actualStart, actualEnd + 1);

let newLines = [...lines.slice(0, actualStart), ...lines.slice(actualEnd + 1)];
const newTargetIdx = newLines.findIndex(l => l.includes('{/* Always Visible Contract Statuses (Booking Staging Zone) */}'));
newLines.splice(newTargetIdx, 0, ...block);
fs.writeFileSync(file, newLines.join('\n'));
console.log('SUCCESS');
