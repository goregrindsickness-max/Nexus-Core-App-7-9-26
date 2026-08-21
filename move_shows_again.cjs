const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block to move
const anchor1 = '📂 ALL SHOWS & DRAFTS';
const lines = content.split('\n');

let blockStartLine = -1;
for (let i = 0; i < lines.length; i++) {
   if (lines[i].includes(anchor1)) {
     blockStartLine = i - 8;
     break;
   }
}

if (blockStartLine !== -1) {
  let divCount = 0;
  let endIdx = -1;
  for(let i = blockStartLine; i < lines.length; i++) {
    if(lines[i].includes('<div')) divCount += (lines[i].match(/<div/g) || []).length;
    if(lines[i].includes('</div')) divCount -= (lines[i].match(/<\/div/g) || []).length;
    if(divCount === 0 && i > blockStartLine) {
      endIdx = i;
      break;
    }
  }

  const blockLines = lines.splice(blockStartLine, endIdx - blockStartLine + 1);
  const block = blockLines.join('\n');
  
  const targetStr = '{/* Empty state description guide if utilizing the fallback venue stage */}';
  let targetIdx = lines.findIndex(l => l.includes(targetStr));
  
  if (targetIdx !== -1) {
    lines.splice(targetIdx, 0, block + '\n');
    fs.writeFileSync(file, lines.join('\n'));
    console.log("Moved ALL SHOWS & DRAFTS out of the grid to Line: " + targetIdx);
  } else {
    console.log("TARGET NOT FOUND");
  }

} else {
  console.log("BLOCK NOT FOUND");
}
