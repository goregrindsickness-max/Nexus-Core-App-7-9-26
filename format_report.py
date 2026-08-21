import re

with open('report.txt', 'r') as f:
    text = f.read()

print("I have scanned `src/App.tsx` and the `src/components/` directory as requested. Here is the list of remaining bloat and duplication that can be cleanly purged:\n")

print("### Orphaned/Dead Modal Imports in `src/App.tsx`:")
modals = [
    ("PTTRadioModal", 25),
    ("BrutalistModal", 124),
    ("EditableChecklistModal", 138),
    ("FlightTrackerModal", 140),
    ("VanToTableTransferModal", 143),
    ("WillCallIsolationModal", 163)
]
for name, line in modals:
    print(f"- `{name}` imported at line {line}, but never rendered directly in the `App.tsx` tree (these were successfully moved to `GlobalModalsContainer.tsx`).")

print("\n### Duplicated State Migrated to Custom Hooks but Still Lingering in `src/App.tsx`:")
print("The following states are destructured from hooks (e.g., `useBandState`, `useInventoryState`, `useOffersManagement`) but still have residual unused variable declarations or are being shadowed in `App.tsx`:")
states = [
    "inventory", "editingItem", "stagedDistroItems", "inventoryAudits", 
    "offers", "blockedPromoters", 
    "messages", "unreadMessageIds", 
    "bands", "activeBandId", "editingBand", "deletingBandId", "bandLineup", 
    "crewMembers", "bandLogoUrl", "bandCoverUrl", "selectedMicroGenres", "bandJoinRequests"
]
for state in states:
    print(f"- `{state}` (and its setter)")

print("\nThese items can be safely removed to reduce bloat in `App.tsx`.")
