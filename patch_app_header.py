import re

with open('src/App.tsx', 'r') as f:
    app = f.read()

header_str = """
        {/* BRAND NAVIGATION HEADER */}
        <BrandNavigationHeader
          activeTab={activeTab} setActiveTab={setActiveTab as any} setDashboardV2ActiveNav={setDashboardV2ActiveNav} triggerNotification={triggerNotification}
          pendingSyncCount={pendingSyncCount} processOfflineQueue={processOfflineQueue} isRosterOwner={isRosterOwner} activePlan={activePlan}
          getTrialCountdownStr={getTrialCountdownStr} activeClearanceLevel={activeClearanceLevel} activeSimulatedMember={activeSimulatedMember}
          userProfile={userProfile} notifications={notifications} setIsNotificationDrawerOpen={setIsNotificationDrawerOpen}
          v2RoleMenuOpen={v2RoleMenuOpen} setV2RoleMenuOpen={setV2RoleMenuOpen} activeBand={activeBand} bands={bands}
          simulatedMemberId={simulatedMemberId} setSimulatedMemberId={setSimulatedMemberId} bandLineup={bandLineup} crewMembers={crewMembers}
          handleOpenMyProfile={handleOpenMyProfile} setUserProfile={setUserProfile} isOfflineSimActive={isOfflineSimActive}
          setIsOfflineSimActive={setIsOfflineSimActive} isOnline={isOnline}
        />
"""

# The chunk we want to replace starts at 5051
import builtins
lines = app.split('\n')
start = -1
for i, line in enumerate(lines):
    if '{/* BRAND NAVIGATION HEADER */}' in line:
        start = i
        break

end = -1
for i in range(start, len(lines)):
    if 'activeTab === \'home-v2\' ? (' in lines[i]:
        end = i - 1
        break

print(f"Start: {start}, End: {end}")

# verify what is at end-1 and end
print(lines[end-1])
print(lines[end])

