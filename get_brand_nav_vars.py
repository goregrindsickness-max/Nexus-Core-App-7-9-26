import re

text = open('brand_nav.txt').read()

vars = re.findall(r'\b(activeTab|setActiveTab|setDashboardV2ActiveNav|triggerNotification|pendingSyncCount|processOfflineQueue|isRosterOwner|activePlan|getTrialCountdownStr|activeClearanceLevel|activeSimulatedMember|userProfile|notifications|setIsNotificationDrawerOpen|v2RoleMenuOpen|setV2RoleMenuOpen|activeBand|bands|setSimulatedMemberId|bandLineup|crewMembers|handleOpenMyProfile|setUserProfile|isOfflineSimActive|setIsOfflineSimActive|isOnline)\b', text)
print(set(vars))
