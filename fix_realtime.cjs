const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

content = content.replace(
  /const unsub = subscribeToTable\('notes', \(payload\) => \{\n\s+if \(!active\) return;\n\s+if \(payload\.eventType === 'INSERT' \|\| payload\.eventType === 'UPDATE'\) \{\n\s+const \{ id, category, text \} = payload\.new;\n\s+if \(category === 'NEXUS_POSTS'\) \{\n\s+try \{\n\s+const parsedPost = JSON\.parse\(text\);/g,
  `const unsub1 = subscribeToTable('nexus_posts', (payload) => {
      if (!active) return;
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        try {
          const parsedPost = payload.new.data;`
);

content = content.replace(
  /\} catch \(e\) \{ \}\n\s+\} else if \(category === 'NEXUS_CHATS' && id === `nexus_chats_\$\{userProfile\?\.email\}`\) \{\n\s+try \{\n\s+isIncomingChatSync\.current = true;\n\s+setChats\(prev => \{\n\s+if \(JSON\.stringify\(prev\) === text\) return prev;\n\s+return JSON\.parse\(text\);\n\s+\}\);\n\s+\} catch \(e\) \{\}\n\s+\} else if \(category === 'NEXUS_NOTIFICATIONS' && id === `nexus_notifications_\$\{userProfile\?\.email\}`\) \{\n\s+try \{\n\s+isIncomingNotifSync\.current = true;\n\s+setNotifications\(prev => \{\n\s+if \(JSON\.stringify\(prev\) === text\) return prev;\n\s+return JSON\.parse\(text\);\n\s+\}\);\n\s+\} catch \(e\) \{\}\n\s+\}\n\s+\}\n\s+\}\);/g,
  `} catch (e) { }
      }
    });

    const unsub2 = subscribeToTable('nexus_chats', (payload) => {
      if (!active) return;
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const { id, data } = payload.new;
        if (id === \`nexus_chats_\${userProfile?.email}\`) {
          try {
            isIncomingChatSync.current = true;
            setChats(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              return data;
            });
          } catch (e) {}
        }
      }
    });

    const unsub3 = subscribeToTable('nexus_notifications', (payload) => {
      if (!active) return;
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const { id, data } = payload.new;
        if (id === \`nexus_notifications_\${userProfile?.email}\`) {
          try {
            isIncomingNotifSync.current = true;
            setNotifications(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              return data;
            });
          } catch (e) {}
        }
      }
    });`
);

content = content.replace(
  /return \(\) => \{\n\s+active = false;\n\s+unsub\(\);\n\s+\};/g,
  `return () => {
      active = false;
      unsub1();
      unsub2();
      unsub3();
    };`
);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
