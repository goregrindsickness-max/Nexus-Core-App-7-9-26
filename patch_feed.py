import re

with open('src/components/social/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

state_inject = "const [selectedSecondaryUserProfile, setSelectedSecondaryUserProfile] = useState<any | null>(null);"
content = content.replace("const [selectedUserProfile, setSelectedUserProfile] = useState<{", state_inject + "\n  const [selectedUserProfile, setSelectedUserProfile] = useState<{")

prop_inject = "setSecondaryUserProfile={setSelectedSecondaryUserProfile}"
# Look for <PublicProfileModal and add it
content = re.sub(r'(<PublicProfileModal[^>]*?setSelectedUserProfile=\{setSelectedUserProfile\})', r'\1\n        setSecondaryUserProfile={setSelectedSecondaryUserProfile}', content)

with open('src/components/social/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)

print("SUCCESS")
