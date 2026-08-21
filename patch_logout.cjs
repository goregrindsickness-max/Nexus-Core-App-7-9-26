const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf-8');

const updated = appTsx.replace(/setUserProfile\(\{\s+id: 'profile_admin',\s+name: 'Admin Profile',\s+email: 'admin@example\.com',[^}]+\}\);/g, 'setUserProfile(null);');

fs.writeFileSync('src/App.tsx', updated);
console.log('Logout patched in App.tsx');
