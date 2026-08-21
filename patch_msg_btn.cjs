const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// First replace the direct message button
code = code.replace(/const targetUser = selectedUserProfile;\s*setSelectedUserProfile\(null\);\s*setActiveTab\('messages'\);\s*setChats\(prev => \{[\s\S]*?return \[newC, \.\.\.prev\];\s*\}\s*\}\);\s*\}\}/g,
`const targetUser = selectedUserProfile;
                          setSelectedUserProfile(null);
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: targetUser?.email || targetUser?.name, username: targetUser?.name, avatar_url: targetUser?.avatar } }));
                        }}`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
