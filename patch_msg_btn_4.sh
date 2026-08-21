sed -i '22390,22415c\
                          const targetUser = selectedUserProfile;\
                          setSelectedUserProfile(null);\
                          window.dispatchEvent(new CustomEvent('\''nexus_open_chat_thread'\'', { detail: { profile_id: targetUser?.email || targetUser?.name, username: targetUser?.name, avatar_url: targetUser?.avatar } }));\
                          triggerNotification?.(`⚡ Opened encrypted channel with ${targetUser?.name || '\''Unknown Label'\''}`);\
' src/components/UniversalSocialFeed.tsx
