const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

content = content.replace(
  /\.from\('notes'\)\n\s+\.select\('text'\)\n\s+\.eq\('id', `nexus_chats_\$\{userProfile\.email\}`\)\n\s+\.single\(\);\n\n\s+if \(data && data\.text\) \{\n\s+const remoteChats = JSON\.parse\(data\.text\);/g,
  `.from('nexus_chats')
          .select('data')
          .eq('id', \`nexus_chats_\${userProfile.email}\`)
          .single();

        if (data && data.data) {
          const remoteChats = data.data;`
);

content = content.replace(
  /localStorage\.setItem\(`nexus_chats_\$\{userProfile\.email\}`,\s*data\.text\);/g,
  "localStorage.setItem(`nexus_chats_${userProfile.email}`, JSON.stringify(data.data));"
);

content = content.replace(
  /\.from\('notes'\)\n\s+\.select\('text'\)\n\s+\.eq\('id', `nexus_notifications_\$\{userProfile\.email\}`\)\n\s+\.single\(\);\n\n\s+if \(data && data\.text\) \{\n\s+const remoteNotifs = JSON\.parse\(data\.text\);/g,
  `.from('nexus_notifications')
          .select('data')
          .eq('id', \`nexus_notifications_\${userProfile.email}\`)
          .single();

        if (data && data.data) {
          const remoteNotifs = data.data;`
);

content = content.replace(
  /localStorage\.setItem\(`nexus_notifications_\$\{userProfile\.email\}`,\s*data\.text\);/g,
  "localStorage.setItem(`nexus_notifications_${userProfile.email}`, JSON.stringify(data.data));"
);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
