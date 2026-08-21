import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = "const postObj = JSON.parse(item.text);"
replacement = "const postObj = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;"

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed feed parsing.")
else:
    print("Target not found.")
