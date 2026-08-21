import re

with open('src/components/dashboard/HomeV2DashboardView.tsx', 'r') as f:
    text = f.read()

# the variables I added:
hooks_vars = [
    'bands', 'setBands', 'activeBandId', 'setActiveBandId', 'currentLoadedBandId', 'setCurrentLoadedBandId',
    'editingBand', 'setEditingBand', 'deletingBandId', 'setDeletingBandId', 'bandLineup', 'setBandLineup',
    'crewMembers', 'setCrewMembers', 'bandLogoUrl', 'setBandLogoUrl', 'bandCoverUrl', 'setBandCoverUrl',
    'selectedMicroGenres', 'setSelectedMicroGenres', 'bandJoinRequests', 'setBandJoinRequests',
    'inventory', 'setInventory', 'editingItem', 'setEditingItem', 'stagedDistroItems', 'setStagedDistroItems',
    'inventoryAudits', 'setInventoryAudits',
    'offers', 'setOffers', 'blockedPromoters', 'setBlockedPromoters'
]

# We want to replace these words + comma with empty string, ONLY inside the giant const { ... } = props; block.
# Actually, since it's just a huge file and we just want to remove these lines if they appear alone on a line,
# or we can just replace them globally (with word boundaries) in the block between line 27 and 745.
lines = text.split('\n')
for i in range(26, 750):
    if i >= len(lines):
        break
    line = lines[i]
    for var in hooks_vars:
        # replace `var,` or `var ,`
        pattern = r'\b' + var + r'\b\s*,'
        line = re.sub(pattern, '', line)
    if line.strip() == '':
        lines[i] = ''
    else:
        lines[i] = line

with open('src/components/dashboard/HomeV2DashboardView.tsx', 'w') as f:
    f.write('\n'.join(lines))
    
print("Removed duplicate variables from props destructuring in HomeV2DashboardView.")
