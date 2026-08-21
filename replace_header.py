with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

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

start = 5050
end = 5542 # Keep up to the line right before `) : activeTab === 'home' ? (`

new_lines = lines[:start] + [header_str] + lines[end-1:]

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)
