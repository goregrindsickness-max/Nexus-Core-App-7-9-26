const fs = require('fs');
const content = fs.readFileSync('src/components/social/modals/PublicProfileModal.tsx', 'utf8');
const avatarRegex = /\{\/\*\s*Avatar section\s*\*\/\}([\s\S]*?)\{\/\*\s*Identity \& Location\s*\*\/\}/;
const match = content.match(avatarRegex);
if(match) {
  console.log("Found Avatar section");
} else {
  console.log("Not found");
}
