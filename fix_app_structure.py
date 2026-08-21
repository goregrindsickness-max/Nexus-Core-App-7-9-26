import re

with open('src/App.tsx', 'r') as f:
    app = f.read()

# We need to find:
#         {/* BRAND NAVIGATION HEADER */}
#         <BrandNavigationHeader ... />
#         ) : activeTab === 'home' ? (
#           <HomeDashboardView ... />
#         ) : activeTab === 'home-v2' ? (

# And replace it with the proper structure:
#         {/* BRAND NAVIGATION HEADER */}
#         <BrandNavigationHeader ... />
#         {isTabRestricted(activeTab, activeClearanceLevel) ? (
#           <div className="flex-grow flex flex-col items-center justify-center p-8 text-center min-h-[70vh] bg-[#030303] text-zinc-300">
#             ...
#           </div>
#         ) : activeTab === 'home' ? (
#           <HomeDashboardView ... />
#         ) : activeTab === 'home-v2' ? (

# Wait, `BrandNavigationHeader` in App.tsx right now ends with:
#         />
#         ) : activeTab === 'home' ? (

# Let's write a regex to find the BrandNavigationHeader usage and the following `) : activeTab === 'home' ? (`
pattern = r'(\{\/\* BRAND NAVIGATION HEADER \*\/\}\s*<BrandNavigationHeader.*?\/>)\s*\)\s*:\s*activeTab === \'home\' \? \('

restricted_view = """
        {isTabRestricted(activeTab, activeClearanceLevel) ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center min-h-[70vh] bg-[#030303] text-zinc-300">
            <div className="max-w-md w-full bg-[#09090b] border border-zinc-800 p-8 rounded-2xl shadow-[0_10px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 via-red-500/10 to-amber-500/10 rounded-2xl blur opacity-65" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-500">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider font-display">
                  Access Restricted
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-2">
                  SECURE PORTAL INTERCEPTED • LEVEL {activeClearanceLevel}
                </p>
                <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 my-6 text-left w-full space-y-2 text-xs">
                  <p className="text-zinc-400 font-sans leading-relaxed">
                    The requested portal <span className="font-mono text-rose-400 font-bold uppercase">{activeTab}</span> is restricted for your active simulated user.
                  </p>
                  <p className="text-zinc-500 font-sans leading-relaxed text-[11px]">
                    To view this tab, you require a higher security clearance level than your current <span className="font-mono text-zinc-300 font-semibold">Level {activeClearanceLevel}</span>.
                  </p>
                </div>
                
                <div className="w-full space-y-3 text-left">
                  <span className="text-[8px] font-mono uppercase text-zinc-500 block mb-1 tracking-wider font-bold">Temporarily elevate simulated identity</span>
                  <select
                    value={simulatedMemberId}
                    onChange={(e) => {
                      const targetId = e.target.value;
                      setSimulatedMemberId(targetId);
                      const combined = [
                        ...(Array.isArray(bandLineup) ? bandLineup : []),
                        ...(Array.isArray(crewMembers) ? crewMembers : [])
                      ];
                      const foundName = combined.find((m: any) => m.id === targetId)?.name || 'Member';
                      triggerNotification?.(`⚡ Simulating ${foundName}`);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#00ffcc]/50 rounded-lg px-2.5 py-2 text-xs text-white font-mono focus:outline-none cursor-pointer"
                  >
                    {[
                      ...(Array.isArray(bandLineup) ? bandLineup : []).map((m: any) => ({ ...m, type: 'Lineup', lvl: m.clearanceLevel || 5 })),
                      ...(Array.isArray(crewMembers) ? crewMembers : []).map((c: any) => ({ ...c, type: 'Crew', lvl: c.clearanceLevel || 1 }))
                    ].map((member: any) => (
                      <option key={member.id} value={member.id}>
                        [{member.type}] {member?.name || 'Unnamed'} ({member.role || 'Crew'}) - Lvl {member.lvl}
                      </option>
                    ))}
                  </select>
                  
                  <button
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
        ) : activeTab === 'home' ? ("""

replacement = r'\1\n' + restricted_view
new_app, count = re.subn(pattern, replacement, app, flags=re.DOTALL)

print(f"Replaced {count} occurrences.")

with open('src/App.tsx', 'w') as f:
    f.write(new_app)
