import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """        if (data && data.data) {
          const remoteChats = data.data;
          if (Array.isArray(remoteChats) && remoteChats.length > 0) {
            setChats(remoteChats);
            localStorage.setItem(`nexus_chats_${userProfile.email}`, JSON.stringify(data.data));
          }
        }"""

replacement = """        if (data && data.data) {
          const remoteChats = data.data;
          if (Array.isArray(remoteChats) && remoteChats.length > 0) {
            isIncomingChatSync.current = true;
            setChats(remoteChats);
            localStorage.setItem(`nexus_chats_${userProfile.email}`, JSON.stringify(data.data));
          }
        }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed chats load.")
else:
    print("Target not found.")
