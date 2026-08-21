const fs = require('fs');
const file = 'src/components/PromoterPortalView.tsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = "activePortalTab === 'workspace' ? (";
console.log(content.indexOf(anchor));
