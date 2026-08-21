const fs = require('fs');

const content = fs.readFileSync('src/components/PromoterPortalView.tsx', 'utf-8');
const startIndex = content.indexOf("activePortalTab === 'routing' && (");
if (startIndex === -1) {
    console.log('Not found');
    process.exit(1);
}

let openParens = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '(') {
        openParens++;
        started = true;
    } else if (content[i] === ')') {
        openParens--;
        if (started && openParens === 0) {
            endIndex = i;
            break;
        }
    }
}

if (endIndex !== -1) {
    fs.writeFileSync('legacy_calendar_chunk.tsx', content.substring(startIndex, endIndex + 1));
    console.log('Extracted', endIndex - startIndex, 'chars');
} else {
    console.log('Could not find end parenthesis');
}
