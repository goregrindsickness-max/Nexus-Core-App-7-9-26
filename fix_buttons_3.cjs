const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target1 = `                            setChats(prev => [newChat, ...prev]);
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;`;

const rep1 = `                            setChats(prev => [newChat, ...prev]);
                          }
                          const posterName = selectedShopItem.sellerName || 'Anonymous Seller';
                          const posterAvatar = selectedShopItem.sellerAvatar;
                          const posterId = selectedShopItem.sellerId || posterName;`;

code = code.replace(target1, rep1);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
