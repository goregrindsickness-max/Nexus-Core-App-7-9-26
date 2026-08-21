import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """        if (active) {
          setFeed(finalFeed);
        }"""

replacement = """        if (active) {
          _setFeed(finalFeed);
        }"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed setFeed to _setFeed in loadFeed.")
else:
    print("Target not found.")
