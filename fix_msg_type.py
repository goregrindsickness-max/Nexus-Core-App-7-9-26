import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = "type MessageType = { id: string; sender: string; text?: string; time: string; image?: string; link?: string; voice?: boolean; voiceDuration?: string; voiceAudioUrl?: string; reactions?: { emoji: string; by: string }[]; replyTo?: MessageType };"
replacement = "type MessageType = { id: string; sender: string; text?: string; time: string; image?: string; link?: string; voice?: boolean; voiceDuration?: string; voiceAudioUrl?: string; reactions?: { emoji: string; by: string }[]; replyTo?: MessageType; status?: 'sent' | 'delivered' | 'read' };"

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed MessageType.")
else:
    print("Target not found.")
