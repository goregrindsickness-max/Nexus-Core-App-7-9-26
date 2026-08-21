const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const regex = /\/\/ Real-time syncing for posts, chats, and notifications\s+useEffect\(\(\) => \{[\s\S]*?\}, \[userProfile\?\.email\]\);/m;

const replacement = `// Real-time syncing for posts, chats, and notifications
  useEffect(() => {
    let active = true;
    const unsub1 = subscribeToTable('nexus_posts', (payload) => {
      if (!active) return;
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        try {
          const parsedPost = payload.new.data;
          _setFeed(prev => {
            const exists = prev.find(p => p.id === parsedPost.id);
            if (exists) {
              if (JSON.stringify(exists) === JSON.stringify(parsedPost)) return prev;
              return prev.map(p => p.id === parsedPost.id ? parsedPost : p);
            } else {
              return [parsedPost, ...prev].sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
            }
          });
        } catch (e) { }
      } else if (payload.eventType === 'DELETE') {
        const { id } = payload.old;
        if (id && id.startsWith('nexus_post_')) {
          const postId = id.replace('nexus_post_', '');
          _setFeed(prev => prev.filter(p => p.id !== postId));
        }
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
    });

    return () => {
      active = false;
      if (unsub1) unsub1();
      if (unsub2) unsub2();
      if (unsub3) unsub3();
    };
  }, [userProfile?.email]);`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
