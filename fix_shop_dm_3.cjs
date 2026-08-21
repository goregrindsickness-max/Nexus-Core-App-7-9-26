const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

code = code.replace(/setChats\(prev => \[newChat, \.\.\.prev\]\);\s*return newChat;\s*\}\);\s*const posterName = selectedShopItem\.sellerName \|\| 'Anonymous Seller';\s*const posterAvatar = selectedShopItem\.sellerAvatar;\s*const posterId = selectedShopItem\.sellerId \|\| posterName;\s*window\.dispatchEvent\(new CustomEvent\('nexus_open_chat_thread', \{ detail: \{ profile_id: posterId, username: posterName, avatar_url: posterAvatar \} \}\)\);\s*setSelectedShopItem\(null\);\s*const posterAvatar2 = selectedShopItem\.sellerAvatar;\s*const posterId2 = selectedShopItem\.sellerId \|\| posterName;\s*window\.dispatchEvent\(new CustomEvent\('nexus_open_chat_thread', \{ detail: \{ profile_id: posterId, username: posterName, avatar_url: posterAvatar \} \}\)\);\s*setSelectedShopItem\(null\);/g,
`setChats(prev => [newChat, ...prev]);
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: posterId, username: posterName, avatar_url: posterAvatar } }));
                          setSelectedShopItem(null);`);

// And I'll just use a generalized regex for the poster / seller one
code = code.replace(/setChats\(prev => \[newChat, \.\.\.prev\]\);\s*return newChat;\s*\}\);/g, `setChats(prev => [newChat, ...prev]);`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
