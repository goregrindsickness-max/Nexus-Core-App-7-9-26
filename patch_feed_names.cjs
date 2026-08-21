const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

content = content.replace(/'Goregrind Sickness'/g, "'Label Head'");
content = content.replace(/'goregrindsickness@gmail.com'/g, "userProfile?.email || 'admin@label.net'");

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Patched names in UniversalSocialFeed");
