const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return (')) {
    console.log(`Line ${i}: ${lines[i]}`);
  }
}
