const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// 1. Remove the old syncPostToSupabase
const oldSyncPost = `  const syncPostToSupabase = async (post: FeedItem) => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      await supabase.from('notes').upsert({
        id: \`nexus_post_\${post.id}\`,
        category: 'NEXUS_POSTS',
        text: JSON.stringify(post),
        created_at: new Date(post.timestamp || Date.now()).toISOString()
      });
    } catch (e) {
      console.warn("Failed to sync post to Supabase", e);
    }
  };`;

content = content.replace(oldSyncPost, '');

// 2. Replace useState and inject _setFeed wrapper
const oldUseState = `  const [feed, setFeed] = useState<FeedItem[]>(mockFeed);`;
const newUseState = `  const [feed, _setFeed] = useState<FeedItem[]>(mockFeed);

  const syncPostToSupabase = async (post: FeedItem) => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      await supabase.from('notes').upsert({
        id: \`nexus_post_\${post.id}\`,
        category: 'NEXUS_POSTS',
        text: JSON.stringify(post),
        created_at: new Date(post.timestamp || Date.now()).toISOString()
      });
    } catch (e) {
      console.warn("Failed to sync post to Supabase", e);
    }
  };

  const setFeed = React.useCallback((action: React.SetStateAction<FeedItem[]>) => {
    _setFeed(prev => {
      const next = typeof action === 'function' ? (action as Function)(prev) : action;
      if (next !== prev) {
        const changedItems = next.filter((item: any) => {
          const oldItem = prev.find((p: any) => p.id === item.id);
          return oldItem && JSON.stringify(oldItem) !== JSON.stringify(item);
        });
        const addedItems = next.filter((item: any) => !prev.some((p: any) => p.id === item.id));

        const toSync = [...changedItems, ...addedItems];
        if (toSync.length > 0) {
           Promise.resolve().then(() => {
              toSync.forEach(item => syncPostToSupabase(item));
           });
        }
      }
      return next;
    });
  }, []);`;

content = content.replace(oldUseState, newUseState);

// 3. Update the realtime subscription to use _setFeed instead of setFeed
// It should be around line 3090, inside `subscribeToTable('notes', ...)`
// Let's replace setFeed(prev => { with _setFeed(prev => { ONLY inside the useEffect for realtime.
// Wait, in my previous script I injected:
// `setFeed(prev => {` for NEXUS_POSTS and `setFeed(prev => prev.filter(p => p.id !== postId));` for DELETE.

content = content.replace(/setFeed\(prev => {/g, (match, offset) => {
  // Only replace the one inside subscribeToTable (NEXUS_POSTS)
  const surrounding = content.substring(Math.max(0, offset - 100), offset + 100);
  if (surrounding.includes('NEXUS_POSTS') && surrounding.includes('subscribeToTable')) {
    return '_setFeed(prev => {';
  }
  return match;
});

content = content.replace(/setFeed\(prev => prev.filter\(p => p.id !== postId\)\);/g, '_setFeed(prev => prev.filter(p => p.id !== postId));');

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Patched realtime logic.");
