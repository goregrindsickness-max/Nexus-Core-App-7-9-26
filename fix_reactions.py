import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">',
    '<div className="mt-1 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">'
)

with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)
print("Updated reactions.")
