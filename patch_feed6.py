import re

with open('src/components/social/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

pattern = r"\{/\* SECONDARY PROFILE VIEW MODAL \*/\}.*?</AnimatePresence>"
content = re.sub(pattern, "", content, count=1, flags=re.DOTALL)

with open('src/components/social/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)

print("SUCCESS")
