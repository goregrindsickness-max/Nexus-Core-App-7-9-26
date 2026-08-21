const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

let startIdx = lines.findIndex(l => l.includes('📂 ALL SHOWS & DRAFTS'));
startIdx -= 8; // go back up to the comment
let divCount = 0;
let endIdx = -1;
for(let i=startIdx; i<lines.length; i++) {
  if (lines[i].includes('<div')) divCount += (lines[i].match(/<div/g) || []).length;
  if (lines[i].includes('</div')) divCount -= (lines[i].match(/<\/div/g) || []).length;
  if(divCount === 0 && i > startIdx) {
    endIdx = i;
    break;
  }
}

const blockLines = lines.slice(startIdx, endIdx + 1);
lines.splice(startIdx, endIdx - startIdx + 1); // remove block

// Now find where to put it
let gStart = lines.findIndex(l => l.includes('grid-cols-1 lg:grid-cols-12 gap-6 relative z-10'));
divCount = 0;
let gEnd = -1;
for(let i=gStart; i<lines.length; i++) {
  if (lines[i].includes('<div')) divCount += (lines[i].match(/<div/g) || []).length;
  if (lines[i].includes('</div')) divCount -= (lines[i].match(/<\/div/g) || []).length;
  if(divCount === 0 && i > gStart) {
    gEnd = i;
    break;
  }
}

lines.splice(gEnd + 1, 0, blockLines.join('\n'));

fs.writeFileSync(file, lines.join('\n'));
console.log("FIXED");
