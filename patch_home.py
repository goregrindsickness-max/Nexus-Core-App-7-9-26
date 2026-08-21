import re

with open('src/components/dashboard/HomeV2DashboardView.tsx', 'r') as f:
    content = f.read()

# Add imports for hooks
content = content.replace('import React from "react";', 'import React from "react";\nimport { useBandState } from "../../hooks/useBandState";\nimport { useInventoryState } from "../../hooks/useInventoryState";\nimport { useOffersManagement } from "../../hooks/useOffersManagement";\nimport { LegacyMetricsCarousel } from "./LegacyMetricsCarousel";')

# Inject hook calls
hook_calls = """
  const { bands, setBands, activeBandId, setActiveBandId, currentLoadedBandId, setCurrentLoadedBandId, editingBand, setEditingBand, deletingBandId, setDeletingBandId, bandLineup, setBandLineup, crewMembers, setCrewMembers, bandLogoUrl, setBandLogoUrl, bandCoverUrl, setBandCoverUrl, selectedMicroGenres, setSelectedMicroGenres, bandJoinRequests, setBandJoinRequests } = useBandState();
  const { inventory, setInventory, editingItem, setEditingItem, stagedDistroItems, setStagedDistroItems, inventoryAudits, setInventoryAudits } = useInventoryState();
  const { offers, setOffers, blockedPromoters, setBlockedPromoters } = useOffersManagement();
"""
content = re.sub(r'(export function HomeV2DashboardView\(.*?\) \{)', r'\1' + hook_calls, content, count=1, flags=re.DOTALL)

with open('src/components/dashboard/HomeV2DashboardView.tsx', 'w') as f:
    f.write(content)
