const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// Remove isYou: true from gallery posts
content = content.replace(/isYou: true\n            \},\n            content: pendingCaption/g, '            },\n            content: pendingCaption');

// Remove isYou: true from shared items
content = content.replace(/role: portalRole === 'band' \? '💀 Artist' : 'User',\n              isYou: true/g, "role: portalRole === 'band' ? '💀 Artist' : 'User'");

// Fix the feed filter at line 20588
content = content.replace(/const posts = feed.filter\(post => post.author.name.toLowerCase\(\) === selectedUserProfile.name.toLowerCase\(\) \|\| \(selectedUserProfile.isYou && post.author.isYou\)\);/g, 
"const posts = feed.filter(post => post.author.name.toLowerCase() === selectedUserProfile.name.toLowerCase());");

// Fix getProfileForUser to also strictly rely on name/handle, ignoring author.isYou which was mistakenly saved globally
content = content.replace(/author.isYou \|\|/g, "");

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
