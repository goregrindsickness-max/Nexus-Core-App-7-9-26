const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const injectRefs = `  const isIncomingChatSync = useRef(false);
  const isIncomingNotifSync = useRef(false);`;

content = content.replace(/  const \[chats, setChats\] = useState<any\[\]>\(\[\]\);/, (m) => m + '\n' + injectRefs);

// Patch chats listener
content = content.replace(/setChats\(prev => \{/g, (m, offset) => {
  if (content.substring(offset - 100, offset + 100).includes('NEXUS_CHATS')) {
    return 'isIncomingChatSync.current = true;\n            setChats(prev => {';
  }
  return m;
});

// Patch notifs listener
content = content.replace(/setNotifications\(prev => \{/g, (m, offset) => {
  if (content.substring(offset - 100, offset + 100).includes('NEXUS_NOTIFICATIONS')) {
    return 'isIncomingNotifSync.current = true;\n            setNotifications(prev => {';
  }
  return m;
});

// Patch the chats useEffect
const chatsEffectRegex = /const saveChatsToSupabase = async \(\) => \{[\s\S]*?saveChatsToSupabase\(\);/m;
const matchedChats = content.match(chatsEffectRegex);
if (matchedChats) {
  const newChatsEffect = `if (isIncomingChatSync.current) {
        isIncomingChatSync.current = false;
        return;
      }
      
      const saveChatsToSupabase = async () => {
        const supabaseClient = getSupabase();
        if (!supabaseClient) return;
        try {
          await supabaseClient
            .from('notes')
            .upsert({
              id: \`nexus_chats_\${userProfile.email}\`,
              category: 'NEXUS_CHATS',
              text: chatsStr,
              created_at: new Date().toISOString()
            });
        } catch (err) {
          console.warn("Failed to persist chats to Supabase:", err);
        }
      };

      saveChatsToSupabase();`;
  content = content.replace(chatsEffectRegex, newChatsEffect);
}

// Patch the notifs useEffect
const notifsEffectRegex = /const saveNotificationsToSupabase = async \(\) => \{[\s\S]*?saveNotificationsToSupabase\(\);/m;
const matchedNotifs = content.match(notifsEffectRegex);
if (matchedNotifs) {
  const newNotifsEffect = `if (isIncomingNotifSync.current) {
        isIncomingNotifSync.current = false;
        return;
      }
      
      const saveNotificationsToSupabase = async () => {
        const supabaseClient = getSupabase();
        if (!supabaseClient) return;
        try {
          await supabaseClient
            .from('notes')
            .upsert({
              id: \`nexus_notifications_\${userProfile.email}\`,
              category: 'NEXUS_NOTIFICATIONS',
              text: notifsStr,
              created_at: new Date().toISOString()
            });
        } catch (err) {
          console.warn("Failed to persist notifs to Supabase:", err);
        }
      };

      saveNotificationsToSupabase();`;
  content = content.replace(notifsEffectRegex, newNotifsEffect);
}

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Patched circular sync.");
