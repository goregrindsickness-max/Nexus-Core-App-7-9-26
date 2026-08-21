with open('brand_nav.txt', 'r') as f:
    text = f.read()

# `brand_nav.txt` was created by taking lines 4531 to 5036 from App.tsx.
# It starts with:
#         {/* BRAND NAVIGATION HEADER */}
#         {activeTab !== 'social' && (
#           <div className="pl-2 pr-5 py-3 flex items-center justify-between border-b border-[#1b1e25] bg-black">
# and ends with the restricted view logic.

# We just want the BrandNavigationHeader portion.
# We know the closing of the header is right before:
#         {isTabRestricted(activeTab, activeClearanceLevel) ? (

header_portion = text.split("        {isTabRestricted(activeTab, activeClearanceLevel) ? (")[0]

# Now we construct the final component:
out = """import React from 'react';
import { Shield, Sparkles, ChevronDown, CheckCircle2, CloudOff, RefreshCcw, Bell } from 'lucide-react';

export function BrandNavigationHeader({ activeTab, setActiveTab, setDashboardV2ActiveNav, triggerNotification, pendingSyncCount, processOfflineQueue, isRosterOwner, activePlan, getTrialCountdownStr, activeClearanceLevel, activeSimulatedMember, userProfile, notifications, setIsNotificationDrawerOpen, v2RoleMenuOpen, setV2RoleMenuOpen, activeBand, bands, simulatedMemberId, setSimulatedMemberId, bandLineup, crewMembers, handleOpenMyProfile, setUserProfile, isOfflineSimActive, setIsOfflineSimActive, isOnline }: any) {
  if (activeTab === 'social') return null;
  return (
    <>
"""

# header_portion currently starts with:
#         {/* BRAND NAVIGATION HEADER */}
#         {activeTab !== 'social' && (
#           <div ...
# We want to remove `{activeTab !== 'social' && (` and the matching `)}`.
# But `header_portion` ends with `)}` because of that condition!

# Let's remove the condition
lines = header_portion.split('\n')
new_lines = []
for line in lines:
    if "{activeTab !== 'social' && (" in line:
        continue
    new_lines.append(line)

# Remove the trailing `)}` from the remaining lines
# We will just pop empty lines and the last `)}`
while new_lines and new_lines[-1].strip() == "":
    new_lines.pop()

if new_lines and new_lines[-1].strip() == ")}":
    new_lines.pop()

out += "\n".join(new_lines)

out += """
    </>
  );
}
"""

with open('src/components/navigation/BrandNavigationHeader.tsx', 'w') as f:
    f.write(out)

