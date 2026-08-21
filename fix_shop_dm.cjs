const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// The original lines at 10892 were part of:
/*
                                messages: [
                                  {
                                    id: `msg_${Date.now()}_init`,
                                    sender: 'them',
*/
// It got replaced with:
/*
                                messages: [
                                  {
                                    id: `msg_${Date.now()}_init`,
                                    sender: 'them',
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: posterId, username: posterName, avatar_url: posterAvatar } }));
                          setSelectedShopItem(null);
                          triggerNotification?.(`Opening chat with ${posterName}...`);
                        }}
*/

code = code.replace(/messages: \[\s*\{\s*id: `msg_\$\{Date\.now\(\)\}_init`,\s*sender: 'them',\s*const posterName = selectedShopItem\.sellerName \|\| 'Anonymous Seller';/g,
`messages: [
                                {
                                  id: \`msg_\${Date.now()}_init\`,
                                  sender: 'them',
                                  text: \`Hey there! I saw you are looking at my \${selectedShopItem.title}. What's up?\`,
                                  time: 'Just now'
                                }
                              ]
                            };
                            setChats(prev => [newChat, ...prev]);
                            return newChat;
                          });
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: posterId, username: posterName, avatar_url: posterAvatar } }));
                          setSelectedShopItem(null);
`);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
