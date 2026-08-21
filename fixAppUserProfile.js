import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace userProfile. but not setUserProfile(
content = content.replace(/([^a-zA-Z])userProfile\./g, '$1userProfile?.');

fs.writeFileSync('src/App.tsx', content);
