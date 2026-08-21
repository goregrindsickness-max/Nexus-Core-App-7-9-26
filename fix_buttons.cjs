const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// For Contact Poster
code = code.replace(/setChats\(prev => \[newChat, \.\.\.prev\]\);\s*const posterName = selectedShopItem\.sellerName \|\| 'Anonymous Seller';\s*const posterAvatar = selectedShopItem\.sellerAvatar;\s*const posterAvatar = selectedShopItem\.sellerAvatar;\s*const posterId = selectedShopItem\.sellerId \|\| posterName;\s*window\.dispatchEvent\(new CustomEvent\('nexus_open_chat_thread', \{ detail: \{ profile_id: posterId, username: posterName, avatar_url: posterAvatar \} \}\)\);\s*setSelectedShopItem\(null\);\s*triggerNotification\?\(`Opening chat with \$\{posterName\}\.\.\.`\);\s*\}\}/g,
`setChats(prev => [newChat, ...prev]);
                            }
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: posterId, username: posterName, avatar_url: posterAvatar } }));
                          setSelectedShopItem(null);
                          triggerNotification?.(\`Opening chat with \${posterName}...\`);
                        }}`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
