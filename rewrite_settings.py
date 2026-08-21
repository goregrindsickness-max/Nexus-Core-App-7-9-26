import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = r"\{/\* Conversation Settings Overlay \*/\}.*?\{/\* End Conversation Settings Overlay \*/\}"
# Wait, do we have an "End Conversation Settings Overlay" comment? 
