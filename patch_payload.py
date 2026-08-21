import re
with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# 1. Update allowed_workspaces
content = re.sub(
    r"allowed_workspaces:\s*isUpgradeMode\s*\?\s*Array\.from\(new Set\(\[\.\.\.\(userProfile\?\.allowed_workspaces \|\| \[\]\),\s*\.\.\.allowedWorkspaces\]\)\)\s*:\s*allowedWorkspaces,",
    r"role: accountTypeToggle === 'Industry Pro' ? 'Industry Pro' : 'Fan Listener',\n          allowed_workspaces: isUpgradeMode\n             ? Array.from(new Set([...(userProfile?.allowed_workspaces || []), ...(accountTypeToggle === 'Industry Pro' ? ['merch', 'tour', 'inventory'] : [])]))\n            : (accountTypeToggle === 'Industry Pro' ? ['merch', 'tour', 'inventory'] : []),",
    content
)

# 2. Update Early Return in handleSignup
replacement = """
      // Advance Block
      if (supabase && newProfileId) {
        setNewUserId(newProfileId);
        setRegistrationPage(2);
        setIsLoading(false);
        return;
      }
      
      // 3. Perform file uploads (now guaranteed to succeed because profile records exist in DB)
"""
content = content.replace(
    "// 3. Perform file uploads (now guaranteed to succeed because profile records exist in DB)",
    replacement
)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
print("Patched payload and advance block!")
