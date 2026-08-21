const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

code = code.replace(/text: \`Hey! Thanks for your interest in my \$\{selectedShopItem\.name\}\. It's still available! Do you have any questions or want to make an offer\?\`,\s*const sellerName/g,
`text: \`Hey! Thanks for your interest in my \${selectedShopItem.name}. It's still available! Do you have any questions or want to make an offer?\`,
                                    time: 'Just now'
                                  }
                                ]
                              };
                              setChats(prev => [newChat, ...prev]);
                            }
                          const sellerName`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
