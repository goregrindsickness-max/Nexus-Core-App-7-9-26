sed -i '10892,10902c\
                          const posterName = selectedShopItem.sellerName || '\''Anonymous Seller'\'';\
                          const posterAvatar = selectedShopItem.sellerAvatar;\
                          const posterId = selectedShopItem.sellerId || posterName;\
                          window.dispatchEvent(new CustomEvent('\''nexus_open_chat_thread'\'', { detail: { profile_id: posterId, username: posterName, avatar_url: posterAvatar } }));\
                          setSelectedShopItem(null);\
' src/components/UniversalSocialFeed.tsx

sed -i '10943,10957c\
                          const sellerName = selectedShopItem.sellerName || '\''Anonymous Seller'\'';\
                          const sellerAvatar = selectedShopItem.sellerAvatar;\
                          const sellerId = selectedShopItem.sellerId || sellerName;\
                          window.dispatchEvent(new CustomEvent('\''nexus_open_chat_thread'\'', { detail: { profile_id: sellerId, username: sellerName, avatar_url: sellerAvatar } }));\
                          setSelectedShopItem(null);\
' src/components/UniversalSocialFeed.tsx

sed -i '16480,16503c\
                                          <button \
                                            onClick={() => {\
                                              window.dispatchEvent(new CustomEvent('\''nexus_open_chat_thread'\'', { detail: { profile_id: profile.name, username: profile.name, avatar_url: profile.image } }));\
                                              setLeftDrawerOpen(false);\
                                              triggerNotification?.(`💬 DM with ${profile.name} opened.`);\
                                            }}\
                                            title="Direct Message"\
' src/components/UniversalSocialFeed.tsx
