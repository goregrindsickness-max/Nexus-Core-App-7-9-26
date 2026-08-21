const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `    loadFeed();
    return () => {
      active = false;
    };
  }, [portalRole, userProfile?.id]);`;

const replacement = `    loadFeed();
    return () => {
      active = false;
    };
  }, [portalRole, userProfile?.id]);

  // Real-time syncing for posts, chats, and notifications
  useEffect(() => {
    let active = true;
    const unsub = subscribeToTable('notes', (payload) => {
      if (!active) return;
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const { id, category, text } = payload.new;
        if (category === 'NEXUS_POSTS') {
          try {
            const parsedPost = JSON.parse(text);
            setFeed(prev => {
              const exists = prev.find(p => p.id === parsedPost.id);
              if (exists) {
                // If it's literally the same, don't update to avoid jitter
                if (JSON.stringify(exists) === text) return prev;
                return prev.map(p => p.id === parsedPost.id ? parsedPost : p);
              } else {
                return [parsedPost, ...prev].sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
              }
            });
          } catch (e) { }
        } else if (category === 'NEXUS_CHATS' && id === \`nexus_chats_\${userProfile?.email}\`) {
          try {
            setChats(prev => {
              if (JSON.stringify(prev) === text) return prev;
              return JSON.parse(text);
            });
          } catch (e) {}
        } else if (category === 'NEXUS_NOTIFICATIONS' && id === \`nexus_notifications_\${userProfile?.email}\`) {
          try {
            setNotifications(prev => {
              if (JSON.stringify(prev) === text) return prev;
              return JSON.parse(text);
            });
          } catch (e) {}
        }
      } else if (payload.eventType === 'DELETE') {
        const { id } = payload.old;
        if (id && id.startsWith('nexus_post_')) {
          const postId = id.replace('nexus_post_', '');
          setFeed(prev => prev.filter(p => p.id !== postId));
        }
      }
    });

    return () => {
      active = false;
      if (unsub) unsub();
    };
  }, [userProfile?.email]);`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
  console.log("Subscription added.");
} else {
  console.log("Target not found!");
}
