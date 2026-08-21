const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
let dStart = lines.findIndex(l => l.includes('DESKTOP ONLY HEADER (Centred presentation as requested)'));
if (dStart !== -1) {
    let brackets = 0;
    let dEnd = -1;
    for(let i = dStart + 1; i < lines.length; i++) {
        let l = lines[i];
        let opens = (l.match(/<div/g) || []).length;
        let closes = (l.match(/<\/div/g) || []).length;
        brackets += opens;
        brackets -= closes;
        if(brackets === 0 && opens === 0 && closes > 0) {
            dEnd = i;
            break;
        }
    }
    console.log("Found dStart: " + dStart + " and dEnd: " + dEnd);
    if(dEnd !== -1) {
        lines.splice(dStart - 1, dEnd - dStart + 2); // remove an empty line before and after?
        fs.writeFileSync(file, lines.join('\n'));
        console.log("Deleted");
    }
}
