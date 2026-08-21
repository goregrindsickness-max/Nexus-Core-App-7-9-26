const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target1 = `                            setChats(prev => [newChat, ...prev]);
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: posterId, username: posterName, avatar_url: posterAvatar } }));
                          setSelectedShopItem(null);
                          triggerNotification?.(\`Opening chat with \${posterName}...\`);
                        }}`;

const rep1 = `                            setChats(prev => [newChat, ...prev]);
                          }
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: posterId, username: posterName, avatar_url: posterAvatar } }));
                          setSelectedShopItem(null);
                          triggerNotification?.(\`Opening chat with \${posterName}...\`);
                        }}`;

code = code.replace(target1, rep1);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
