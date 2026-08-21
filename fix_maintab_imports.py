with open('src/components/views/MainTabRouter.tsx', 'r') as f:
    text = f.read()

# Replace those broken lines
broken = """  const {                      setBandJoinRequests } = useBandState();
  const {        setInventoryAudits } = useInventoryState();
  const {    setBlockedPromoters } = useOffersManagement();"""

fixed = """  const { bands, setBands, activeBandId, setActiveBandId, currentLoadedBandId, setCurrentLoadedBandId, editingBand, setEditingBand, deletingBandId, setDeletingBandId, bandLineup, setBandLineup, crewMembers, setCrewMembers, bandLogoUrl, setBandLogoUrl, bandCoverUrl, setBandCoverUrl, selectedMicroGenres, setSelectedMicroGenres, bandJoinRequests, setBandJoinRequests } = useBandState();
  const { inventory, setInventory, editingItem, setEditingItem, stagedDistroItems, setStagedDistroItems, inventoryAudits, setInventoryAudits } = useInventoryState();
  const { offers, setOffers, blockedPromoters, setBlockedPromoters } = useOffersManagement();"""

text = text.replace(broken, fixed)

with open('src/components/views/MainTabRouter.tsx', 'w') as f:
    f.write(text)

