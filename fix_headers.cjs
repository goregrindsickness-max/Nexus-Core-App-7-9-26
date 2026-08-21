const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find mobile header
let mStart = lines.findIndex(l => l.includes('MOBILE ONLY PLAYGROUND HEADER (Original layout exactly as before last 3 requests)'));
if (mStart !== -1) {
  lines[mStart] = '        {/* PLAYGROUND HEADER */}';
  
  // Find the div right after it
  let divIdx = mStart + 1;
  if(lines[divIdx].includes('<div className="block lg:hidden border border-zinc-800/80')) {
     lines[divIdx] = lines[divIdx]
       .replace('block lg:hidden ', '')
       .replace('id="promoter-profile-card-mobile"', 'id="promoter-profile-card"');
  }
}

// Find desktop header
let dStart = lines.findIndex(l => l.includes('DESKTOP ONLY HEADER (Centred presentation as requested)'));
if (dStart !== -1) {
    let divCount = 0;
    let dEnd = -1;
    // Assume it starts on dStart + 1
    for(let i = dStart + 1; i < lines.length; i++) {
        if(lines[i].includes('<div')) divCount += (lines[i].match(/<div/g) || []).length;
        if(lines[i].includes('</div')) divCount -= (lines[i].match(/<\/div/g) || []).length;
        if(divCount === 0 && i > dStart + 1) {
            dEnd = i;
            break;
        }
    }
    
    if (dEnd !== -1) {
        // remove the desktop only block
        lines.splice(dStart, dEnd - dStart + 1);
    }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed headers');
