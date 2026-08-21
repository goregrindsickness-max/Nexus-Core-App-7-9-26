const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
for(let i=1000; i<3800; i++) {
  if (lines[i] && lines[i].includes('lg:') && !lines[i].includes('text-lg') && !lines[i].includes('rounded-lg') && !lines[i].includes('shadow-lg') && !lines[i].includes('max-w-lg')) {
    console.log(i + ': ' + lines[i]);
  }
}
