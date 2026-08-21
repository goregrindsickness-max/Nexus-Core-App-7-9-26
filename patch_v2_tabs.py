import re

with open('src/components/PromoterDashboardViewV2.tsx', 'r') as f:
    content = f.read()

# Replace WORKSPACE tab
workspace_regex = r"(\{\s*activeTab === 'WORKSPACE' && \(\s*)<div className=\"space-y-10 max-w-5xl mx-auto animate-fade-in w-full pb-16 px-4 flex items-center justify-center min-h-\[40vh\]\">.*?(\)\s*\})"
workspace_repl = r"""{activeTab === 'WORKSPACE' && (
            <div className="w-full h-full animate-fade-in">
              <PromoterPortalView 
                isolatedTab="workspace"
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                onLogout={onLogout}
                triggerNotification={triggerNotification}
                addLog={addLog}
                bands={bands}
                offers={offers}
                onCreateOffer={onCreateOffer!}
                onUpdateOffer={onUpdateOffer!}
                shows={shows}
              />
            </div>
          )}"""
content = re.sub(workspace_regex, workspace_repl, content, flags=re.DOTALL)

# Let's find OFFERS tab boundaries since it's large
offers_start = content.find("{activeTab === 'OFFERS' && (")
if offers_start != -1:
    offers_end = content.find("          {/* TEAMS TAB RENDERING */}", offers_start)
    if offers_end != -1:
        offers_repl = r"""{activeTab === 'OFFERS' && (
            <div className="w-full h-full animate-fade-in">
              <PromoterPortalView 
                isolatedTab="offers"
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                onLogout={onLogout}
                triggerNotification={triggerNotification}
                addLog={addLog}
                bands={bands}
                offers={offers}
                onCreateOffer={onCreateOffer!}
                onUpdateOffer={onUpdateOffer!}
                shows={shows}
              />
            </div>
          )}
"""
        content = content[:offers_start] + offers_repl + "\n" + content[offers_end:]

# Replace SALES tab
sales_start = content.find("{activeTab === 'SALES' && (")
if sales_start != -1:
    sales_end = content.find("{/* SETTINGS TAB RENDERING */}", sales_start)
    if sales_end != -1:
        sales_repl = r"""{activeTab === 'SALES' && (
            <div className="w-full h-full animate-fade-in">
              <PromoterPortalView 
                isolatedTab="sales"
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                onLogout={onLogout}
                triggerNotification={triggerNotification}
                addLog={addLog}
                bands={bands}
                offers={offers}
                onCreateOffer={onCreateOffer!}
                onUpdateOffer={onUpdateOffer!}
                shows={shows}
              />
            </div>
          )}
"""
        content = content[:sales_start] + sales_repl + "\n          " + content[sales_end:]

with open('src/components/PromoterDashboardViewV2.tsx', 'w') as f:
    f.write(content)
print("Patched WORKSPACE, OFFERS, SALES in V2.")

