const fs = require('fs');
const content = fs.readFileSync('src/components/social/modals/PublicProfileModal.tsx', 'utf8');
console.log(content.substring(300, 1000));
