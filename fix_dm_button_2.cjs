const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

code = code.replace(/setActiveTab\('messages'\);\s*setSelectedChatId\('morbid_angel'\);\s*setLeftDrawerOpen\(false\);\s*triggerNotification\?\(`💬 DM with \$\{profile\.name\} opened\.`\);/g,
`window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: profile.name, username: profile.name, avatar_url: profile.image } }));
                                              setLeftDrawerOpen(false);
                                              triggerNotification?.(\`💬 DM with \${profile.name} opened.\`);`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
