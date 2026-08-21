const fs = require('fs');

const lines = fs.readFileSync('src/components/LabelDashboardViewV2.tsx', 'utf-8').split('\n');

let endIdx = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Quick Action Buttons (Desktop)")) {
        endIdx = i;
        break;
    }
}
console.log("End index: " + endIdx);
