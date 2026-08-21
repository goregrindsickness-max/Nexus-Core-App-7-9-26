with open('brand_nav.txt', 'r') as f:
    brand = f.read()

missing_end = """
                    onClick={() => {
                      setSimulatedMemberId('');
                      triggerNotification?.("⚡ Returned to normal view");
                    }}
                    className="w-full bg-red-950/40 text-red-400 border border-red-900 hover:bg-red-900/60 rounded-lg py-2 text-xs font-mono transition-all"
                  >
                    Clear Simulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
"""

with open('src/components/navigation/BrandNavigationHeader.tsx', 'w') as f:
    f.write("import React from 'react';\n")
    f.write("import { Shield, Sparkles, ChevronDown, CheckCircle2, CloudOff, RefreshCcw, Bell } from 'lucide-react';\n\n")
    f.write("export function BrandNavigationHeader({ activeTab, setActiveTab, setDashboardV2ActiveNav, triggerNotification, pendingSyncCount, processOfflineQueue, isRosterOwner, activePlan, getTrialCountdownStr, activeClearanceLevel, activeSimulatedMember, userProfile, notifications, setIsNotificationDrawerOpen, v2RoleMenuOpen, setV2RoleMenuOpen, activeBand, bands, simulatedMemberId, setSimulatedMemberId, bandLineup, crewMembers, handleOpenMyProfile, setUserProfile, isOfflineSimActive, setIsOfflineSimActive, isOnline }: any) {\n")
    f.write("  if (activeTab === 'social') return null;\n")
    f.write("  return (\n")
    
    # Strip the leading `        {activeTab !== 'social' && (`
    # Actually, we can just strip the first line and use regex.
    import re
    cleaned = re.sub(r'^\s*\{activeTab !== \'social\' && \(\s*', '', brand)
    # also we replace the end if it's there
    cleaned = cleaned + missing_end
    f.write(cleaned)
    f.write("  );\n}\n")
