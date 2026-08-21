import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    lines = f.readlines()

def is_bare_call(line_num, line):
    # Check if it's deeply indented (usually implies inside a block/callback)
    if line.startswith('      '): # 6+ spaces
        return False
    # If it has onClick, onChange, =>, etc
    if '=>' in line or 'onClick' in line or 'onChange' in line:
        return False
    return True

for i, line in enumerate(lines):
    if 'setUserProfile' in line or 'setBands' in line or 'setBandJoinRequests' in line or 'onLogout' in line or 'onUpgradeToPro' in line or 'triggerNotification' in line:
        if is_bare_call(i+1, line):
            print(f"{i+1}: {line.strip()}")
