const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

content = content.replace(/setNotifications\(prev => \{\n              if \(JSON\.stringify\(prev\) === text\) return prev;\n              return JSON\.parse\(text\);\n            \}\);/, "isIncomingNotifSync.current = true;\n            setNotifications(prev => {\n              if (JSON.stringify(prev) === text) return prev;\n              return JSON.parse(text);\n            });");

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Fixed notifs sync ref");
