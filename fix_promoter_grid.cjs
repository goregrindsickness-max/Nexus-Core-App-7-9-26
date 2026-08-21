const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor1 = '{/* COMPREHENSIVE CURRENT AND UPCOMING SHOWS & DRAFTS LIST */}';
const targetStart = content.indexOf(anchor1);

if(targetStart !== -1) {
  let startIdx = content.indexOf('<div', targetStart);
  let divCount = 0;
  let endIdx = -1;
  const lines = content.split('\n');
  const startLine = content.substring(0, startIdx).split('\n').length - 1;
  
  for(let i = startLine; i < lines.length; i++) {
    if(lines[i].includes('<div')) divCount += (lines[i].match(/<div/g) || []).length;
    if(lines[i].includes('</div')) divCount -= (lines[i].match(/<\/div/g) || []).length;
    if(divCount === 0 && i >= startLine) {
      endIdx = i;
      break;
    }
  }

  const blockLines = lines.slice(startLine - 1, endIdx + 1);
  const block = blockLines.join('\n');
  
  lines.splice(startLine - 1, blockLines.length);
  
  let gridStartLine = lines.findIndex(l => l.includes('grid-cols-1 lg:grid-cols-12 gap-6 relative z-10'));
  let gCount = 0;
  let gEnd = -1;
  for(let i = gridStartLine; i < lines.length; i++) {
    if(lines[i].includes('<div')) gCount += (lines[i].match(/<div/g) || []).length;
    if(lines[i].includes('</div')) gCount -= (lines[i].match(/<\/div/g) || []).length;
    if(gCount === 0 && i >= gridStartLine) {
      gEnd = i;
      break;
    }
  }
  
  lines.splice(gEnd + 1, 0, block);
  fs.writeFileSync(file, lines.join('\n'));
  console.log("Moved ALL SHOWS & DRAFTS out of the grid");
} else {
  console.log("Could not find ALL SHOWS & DRAFTS");
}
