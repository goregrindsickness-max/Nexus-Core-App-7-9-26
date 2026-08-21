const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// For posterName
code = code.replace(/setChats\(prev => \[newChat, \.\.\.prev\]\);\s*\}\s*const posterName = selectedShopItem\.sellerName \|\| 'Anonymous Seller';\s*const posterAvatar = selectedShopItem\.sellerAvatar;\s*const posterId = selectedShopItem\.sellerId \|\| posterName;\s*window\.dispatchEvent\(new CustomEvent\('nexus_open_chat_thread', \{ detail: \{ profile_id: posterId, username: posterName, avatar_url: posterAvatar \} \}\)\);\s*setSelectedShopItem\(null\);\s*triggerNotification\?\(`Opening chat with \$\{posterName\}\.\.\.`\);\s*\}\}/g,
`setChats(prev => [newChat, ...prev]);
                            }
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: posterId, username: posterName, avatar_url: matchedProf?.avatar_url } }));
                          setSelectedShopItem(null);
                        }}`);

// For sellerName
code = code.replace(/setChats\(prev => \[newChat, \.\.\.prev\]\);\s*\}\s*const sellerName = selectedShopItem\.sellerName \|\| 'Anonymous Seller';\s*const sellerAvatar = selectedShopItem\.sellerAvatar;\s*const sellerId = selectedShopItem\.sellerId \|\| sellerName;\s*window\.dispatchEvent\(new CustomEvent\('nexus_open_chat_thread', \{ detail: \{ profile_id: sellerId, username: sellerName, avatar_url: sellerAvatar \} \}\)\);\s*setSelectedShopItem\(null\);\s*triggerNotification\?\(`Opening chat with \$\{sellerName\}\.\.\.`\);\s*\}\}\s*className="w-full py\.2\.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-700"\s*>\s*<MessageSquare className="w-4 h-4" \/> Message Seller\s*<\/div>\s*\) : \(\s*<button/g,
`setChats(prev => [newChat, ...prev]);
                            }
                          window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: sellerId, username: sellerName, avatar_url: selectedShopItem.sellerAvatar } }));
                          setSelectedShopItem(null);
                        }}
                        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-700"
                      >
                        <MessageSquare className="w-4 h-4" /> Message Seller
                      </button>
                    ) : (
                      <button`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
