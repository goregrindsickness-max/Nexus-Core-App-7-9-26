import re
with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# 1. Update account_type
content = re.sub(
    r"account_type: isUpgradeMode \? \(userProfile\?\.account_type \|\| finalAccountType\) : 'fan',",
    r"account_type: accountTypeToggle === 'Industry Pro' ? 'pro' : 'fan',",
    content
)

# 2. Update registered_workspaces
content = re.sub(
    r"registered_workspaces: isUpgradeMode\s*\?\s*Array\.from\(new Set\(\[\.\.\.\(userProfile\?\.registered_workspaces \|\| \[\]\),\s*\.\.\.allowedWorkspaces\]\)\)\s*:\s*allowedWorkspaces,",
    r"registered_workspaces: isUpgradeMode\n             ? Array.from(new Set([...(userProfile?.registered_workspaces || []), ...(accountTypeToggle === 'Industry Pro' ? ['merch', 'tour', 'inventory'] : [])]))\n            : (accountTypeToggle === 'Industry Pro' ? ['merch', 'tour', 'inventory'] : []),",
    content
)

# 3. Update avatar and banner in buildProfileObject to empty values as requested
content = re.sub(
    r"avatar_url: sanitizeImageUrl\([\s\S]*?'/Nexus Icon brackets\.png'\n          \),",
    r"avatar_url: '/Nexus Icon brackets.png',",
    content
)

content = re.sub(
    r"banner_url: sanitizeImageUrl\([\s\S]*?undefined\n          \),",
    r"banner_url: undefined,",
    content
)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
print("Patched account type, registered workspaces and visual fields!")
