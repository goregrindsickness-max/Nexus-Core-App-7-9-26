const fs = require('fs');
const path = './src/components/PlansView.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

lines[800] = `                    <span className="text-sm font-bold text-[#10B981]">\${BAND_PORTAL_BILLING.singleUsePasses.per_tour.price}</span>`;
lines[1190] = `                    <span className="text-sm font-bold text-[#10B981]">\${BAND_PORTAL_BILLING.singleUsePasses.per_tour.price}</span>`;
lines[1912] = `                    <span className="text-sm font-bold text-[#10B981]">\${BAND_PORTAL_BILLING.singleUsePasses.per_tour.price}</span>`;

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed');
