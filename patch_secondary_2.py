import re

with open('src/components/social/modals/PublicProfileModal.tsx', 'r') as f:
    modal_content = f.read()

props_pattern = r"setShopBrandFilter\?: \(brand: string\) => void;"
props_replacement = "setShopBrandFilter?: (brand: string) => void;\n  setSecondaryUserProfile?: (user: any) => void;"
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
