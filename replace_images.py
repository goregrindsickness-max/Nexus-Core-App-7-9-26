import os
import re

replacements = {
    "TDF 1 Coffee Mug.jpg": "TDF 1 Coffee Mug.png",
    "TDF 1 Keychain.jpg": "TDF 1 Keychain.png",
    "TDF 1 Sweatpants.jpg": "TDF Sweatpants copy.png",
    "Virulent Excision - Manifestations TS.jpg": "Virulent Excision - Chambers of Regeneration TS.jpeg",
    "VE Background 2026.jpg": "Virulent Excision - Chambers of Regeneration TS.jpeg",
    "high_energy_live_music_concert_19830850.png": "High energy live music concert 1.png"
}

files_to_check = [
    "src/components/social/drawers/LeftProfileDrawer.tsx",
    "src/components/social/UniversalSocialFeed.tsx",
    "src/components/social/TimelineFeed.tsx",
    "src/components/GuestPassConfirmView.tsx",
    "src/data/socialFeedMockData.ts"
]

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    modified = content
    for old, new in replacements.items():
        modified = modified.replace(old, new)
        
    if modified != content:
        with open(filepath, 'w') as f:
            f.write(modified)
        print(f"Updated {filepath}")

