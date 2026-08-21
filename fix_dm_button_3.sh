sed -i '16496,16499c\
                                              window.dispatchEvent(new CustomEvent('\''nexus_open_chat_thread'\'', { detail: { profile_id: profile.name, username: profile.name, avatar_url: profile.image } }));\
                                              setLeftDrawerOpen(false);\
                                              triggerNotification?.(`💬 DM with ${profile.name} opened.`);\
' src/components/UniversalSocialFeed.tsx
