import re

with open('src/components/social/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

# Add state
state_pattern = r"const \[selectedUserProfile, setSelectedUserProfile\] = useState<\{[^\}]+\} \| null>\(null\);"
state_replacement = "const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);\n  const [selectedSecondaryUserProfile, setSelectedSecondaryUserProfile] = useState<any | null>(null);"
content = re.sub(state_pattern, state_replacement, content)

# Add AnimatePresence for secondary profile
modal_pattern = r"\{selectedUserProfile && \(\n\s*<PublicProfileModal\n\s*selectedUserProfile=\{selectedUserProfile\}\n\s*setSelectedUserProfile=\{setSelectedUserProfile\}\n\s*setLeftDrawerOpen=\{setLeftDrawerOpen\}\n\s*setDrawerCurrentView=\{setDrawerCurrentView\}\n\s*/>\n\s*\)\}"
modal_replacement = """{selectedUserProfile && (
          <PublicProfileModal
            selectedUserProfile={selectedUserProfile}
            setSelectedUserProfile={setSelectedUserProfile}
            setLeftDrawerOpen={setLeftDrawerOpen}
            setDrawerCurrentView={setDrawerCurrentView}
            setSecondaryUserProfile={setSelectedSecondaryUserProfile}
          />
        )}
        {selectedSecondaryUserProfile && (
          <PublicProfileModal
            selectedUserProfile={selectedSecondaryUserProfile}
            setSelectedUserProfile={setSelectedSecondaryUserProfile}
          />
        )}"""
content = re.sub(modal_pattern, modal_replacement, content)

with open('src/components/social/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)

with open('src/components/social/modals/PublicProfileModal.tsx', 'r') as f:
    modal_content = f.read()

props_pattern = r"setDrawerCurrentView\?: \(view: 'profile' \| 'messages' \| 'stats' \| 'settings' \| 'notifications'\) => void;\n\}"
props_replacement = "setDrawerCurrentView?: (view: 'profile' | 'messages' | 'stats' | 'settings' | 'notifications') => void;\n  setSecondaryUserProfile?: (user: any) => void;\n}"
modal_content = re.sub(props_pattern, props_replacement, modal_content)

click_pattern = r"if \(realProfile\) \{\n\s*if \(realProfile\.isYou \|\| realProfile\.id === userProfile\?\.id\) \{\n\s*setLeftDrawerOpen\?\(\true\);\n\s*setDrawerCurrentView\?\('profile'\);\n\s*\} else \{\n\s*setSelectedUserProfile\(realProfile\);\n\s*\}\n\s*\} else \{"
click_replacement = """if (realProfile) {
                                  if (setSecondaryUserProfile) {
                                    setSecondaryUserProfile({ ...realProfile, isYou: false });
                                  } else {
                                    setSelectedUserProfile({ ...realProfile, isYou: false });
                                  }
                                } else {"""
modal_content = re.sub(click_pattern, click_replacement, modal_content)

with open('src/components/social/modals/PublicProfileModal.tsx', 'w') as f:
    f.write(modal_content)

print("SUCCESS")
