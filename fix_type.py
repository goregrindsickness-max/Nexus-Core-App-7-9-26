import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'voice?: boolean; voiceDuration?: string; reactions?:',
    'voice?: boolean; voiceDuration?: string; voiceAudioUrl?: string; reactions?:'
)

with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)
print("Updated type.")
