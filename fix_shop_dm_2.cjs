const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

code = code.replace(/messages: \[\s*\{\s*id: `msg_\$\{Date\.now\(\)\}_init`,\s*sender: 'them',\s*const sellerName = selectedShopItem\.sellerName \|\| 'Anonymous Seller';/g,
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
                          const sellerName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const sellerAvatar = selectedShopItem.sellerAvatar;
                          const sellerId = selectedShopItem.sellerId || sellerName;
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: sellerId, username: sellerName, avatar_url: sellerAvatar } }));
                          setSelectedShopItem(null);
`);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
