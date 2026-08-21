const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

code = code.replace(/const sellerName = selectedShopItem\.sellerName \|\| 'Anonymous Seller';\s*const sellerAvatar = selectedShopItem\.sellerAvatar;\s*const sellerId = selectedShopItem\.sellerId \|\| sellerName;\s*\}\s*setSelectedShopItem\(null\);/g,
`window.dispatchEvent(new CustomEvent('nexus_open_chat_thread', { detail: { profile_id: sellerId, username: sellerName, avatar_url: matchedProf?.avatar_url } }));
                            setSelectedShopItem(null);`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
