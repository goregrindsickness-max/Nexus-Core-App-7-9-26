import re

with open('src/components/views/MainTabRouter.tsx', 'r') as f:
    text = f.read()

hooks_vars = [
    'bands', 'setBands', 'activeBandId', 'setActiveBandId', 'currentLoadedBandId', 'setCurrentLoadedBandId',
    'editingBand', 'setEditingBand', 'deletingBandId', 'setDeletingBandId', 'bandLineup', 'setBandLineup',
    'crewMembers', 'setCrewMembers', 'bandLogoUrl', 'setBandLogoUrl', 'bandCoverUrl', 'setBandCoverUrl',
    'selectedMicroGenres', 'setSelectedMicroGenres', 'bandJoinRequests', 'setBandJoinRequests',
    'inventory', 'setInventory', 'editingItem', 'setEditingItem', 'stagedDistroItems', 'setStagedDistroItems',
    'inventoryAudits', 'setInventoryAudits',
    'offers', 'setOffers', 'blockedPromoters', 'setBlockedPromoters'
]

lines = text.split('\n')
for i in range(15, 300):
    if i >= len(lines):
        break
    line = lines[i]
    for var in hooks_vars:
        pattern = r'\b' + var + r'\b\s*,'
        line = re.sub(pattern, '', line)
    if line.strip() == '':
        lines[i] = ''
    else:
        lines[i] = line

with open('src/components/views/MainTabRouter.tsx', 'w') as f:
    f.write('\n'.join(lines))
    
print("Removed duplicate variables from props destructuring in MainTabRouter.")
