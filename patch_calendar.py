with open('src/components/PromoterDashboardViewV2.tsx', 'r') as f:
    content = f.read()

start_marker = "{/* Calendar & Show Itineraries */}\n                {(!subTab || subTab === 'calendar') && (\n                  <div className=\"space-y-4\">"
# We need to find the matching closing div and `)}` for this block.
# I'll just use regex to replace from start_marker to the start of "                {/* Regional Routing Control Room */}"

import re

# We will grab from start_marker all the way to just before "                {/* Regional Routing Control Room */}"
pattern = re.compile(r"\{\/\* Calendar & Show Itineraries \*\/}.*?(?=\{\/\* Regional Routing Control Room \*\/})", re.DOTALL)

new_text = """{/* Calendar & Show Itineraries */}
                {(!subTab || subTab === 'calendar') && (
                  <div className="w-full animate-fade-in -mt-2">
                    <PromoterPortalView 
                      isolatedTab="routing"
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

if pattern.search(content):
    content = pattern.sub(new_text, content)
    with open('src/components/PromoterDashboardViewV2.tsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Pattern not found")
