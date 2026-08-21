const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// 1. syncPostToSupabase
content = content.replace(
  /await supabase\.from\('notes'\)\.upsert\(\{\n\s+id: `nexus_post_\$\{post\.id\}`,\n\s+category: 'NEXUS_POSTS',\n\s+text: JSON\.stringify\(post\),\n\s+created_at: new Date\(post\.timestamp \|\| Date\.now\(\)\)\.toISOString\(\)\n\s+\}\);/g,
  "await supabase.from('nexus_posts').upsert({ id: `nexus_post_${post.id}`, data: post, created_at: new Date(post.timestamp || Date.now()).toISOString() });"
);

// 2. load posts from Supabase
content = content.replace(
  /\.from\('notes'\)\n\s+\.select\('\*'\)\n\s+\.eq\('category', 'NEXUS_POSTS'\)/g,
  ".from('nexus_posts').select('*')"
);

content = content.replace(
  /const parsed = JSON\.parse\((item|note)\.text\);/g,
  "const parsed = $1.data;"
);

// 3. saveChatsToSupabase
content = content.replace(
  /await supabaseClient\n\s+\.from\('notes'\)\n\s+\.upsert\(\{\n\s+id: `nexus_chats_\$\{userProfile\.email\}`,\n\s+category: 'NEXUS_CHATS',\n\s+text: chatsStr,\n\s+created_at: new Date\(\)\.toISOString\(\)\n\s+\}\);/g,
  "await supabaseClient.from('nexus_chats').upsert({ id: `nexus_chats_${userProfile.email}`, data: chats, created_at: new Date().toISOString() });"
);

// 4. saveNotificationsToSupabase
content = content.replace(
  /await supabaseClient\n\s+\.from\('notes'\)\n\s+\.upsert\(\{\n\s+id: `nexus_notifications_\$\{userProfile\.email\}`,\n\s+category: 'NEXUS_NOTIFICATIONS',\n\s+text: notifsStr,\n\s+created_at: new Date\(\)\.toISOString\(\)\n\s+\}\);/g,
  "await supabaseClient.from('nexus_notifications').upsert({ id: `nexus_notifications_${userProfile.email}`, data: notifications, created_at: new Date().toISOString() });"
);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
