const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

let dStart = lines.findIndex(l => l.includes('DESKTOP ONLY HEADER (Centred presentation as requested)'));
let nTab = lines.findIndex(l => l.includes('Tab Selection separated into its own styled card'));

if (dStart !== -1 && nTab !== -1) {
    let toRemove = nTab - dStart;
    lines.splice(dStart, toRemove);
    fs.writeFileSync(file, lines.join('\n'));
    console.log("DELETED DESKTOP BLOCK");
}
