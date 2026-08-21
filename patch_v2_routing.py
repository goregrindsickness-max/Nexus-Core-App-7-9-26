import re

with open("src/components/PromoterDashboardViewV2.tsx", "r") as f:
    content = f.read()

# We need to replace the section starting with:
#               {/* TWO COLUMN INTERACTIVE LAYOUT (MIGRATED FROM V1 HUB) */}
# and ending at the closing div before:
#           )}
# 
#           {/* SOCIAL TAB RENDERING */}

new_content = """              {/* TWO COLUMN INTERACTIVE LAYOUT (REPLACED WITH HIGH-DENSITY COMMAND DECK) */}
              <div className="w-full mt-6 space-y-4">
                {/* High-Velocity Launcher Deck */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] py-2.5 rounded-md hover:border-yellow-500/40 hover:text-white text-center font-bold transition-all truncate px-1">
                    📅 EVENT WORKSPACE
                  </button>
                  <button className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] py-2.5 rounded-md hover:border-yellow-500/40 hover:text-white text-center font-bold transition-all truncate px-1">
                    📝 CONTRACTS HUB
                  </button>
                  <button className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] py-2.5 rounded-md hover:border-yellow-500/40 hover:text-white text-center font-bold transition-all truncate px-1">
                    📊 SALES MANAGER
                  </button>
                  <button className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] py-2.5 rounded-md hover:border-yellow-500/40 hover:text-white text-center font-bold transition-all truncate px-1">
                    🎟️ DOOR TERMINAL
                  </button>
                </div>

                {/* Tab Switcher Ribbon */}
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                  <button 
                    onClick={() => setSubTab('calendar')}
                    className={`px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-t-md transition-all ${(!subTab || subTab === 'calendar') ? 'text-lime-400 border-b-2 border-lime-400 bg-lime-950/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Tab 1: Calendar & Show Itineraries
                  </button>
                  <button 
                    onClick={() => setSubTab('regional')}
                    className={`px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider rounded-t-md transition-all ${(subTab === 'regional') ? 'text-lime-400 border-b-2 border-lime-400 bg-lime-950/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Tab 2: Regional Routing Control
                  </button>
                </div>

                {/* Tab 1: Calendar & Show Itineraries */}
                {(!subTab || subTab === 'calendar') && (
                  <div className="space-y-4">
                    {/* Top Component (Full-Width Calendar Matrix) */}
                    <div className="w-full max-w-full mb-4">
                      <div className="grid grid-cols-7 gap-1 bg-zinc-950 p-3 border border-zinc-900 rounded-xl font-mono text-xs text-center text-zinc-400">
                        {/* Days of week header */}
                        <div className="font-bold text-zinc-500 pb-2 border-b border-zinc-900 mb-2">SUN</div>
                        <div className="font-bold text-zinc-500 pb-2 border-b border-zinc-900 mb-2">MON</div>
                        <div className="font-bold text-zinc-500 pb-2 border-b border-zinc-900 mb-2">TUE</div>
                        <div className="font-bold text-zinc-500 pb-2 border-b border-zinc-900 mb-2">WED</div>
                        <div className="font-bold text-zinc-500 pb-2 border-b border-zinc-900 mb-2">THU</div>
                        <div className="font-bold text-zinc-500 pb-2 border-b border-zinc-900 mb-2">FRI</div>
                        <div className="font-bold text-zinc-500 pb-2 border-b border-zinc-900 mb-2">SAT</div>
                        {/* Empty cells for June */}
                        <div className="p-2 border border-zinc-900/50 rounded bg-zinc-950/30"></div>
                        <div className="p-2 border border-zinc-900/50 rounded bg-zinc-950/30"></div>
                        <div className="p-2 border border-zinc-900/50 rounded bg-zinc-950/30"></div>
                        {/* Days 1-10 */}
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">1</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">2</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">3</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900 text-lime-400 border-lime-500/30">4</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">5</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">6</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">7</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">8</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900 text-[#00ffcc] border-[#00ffcc]/30">9</div>
                        <div className="p-2 border border-lime-500 rounded bg-lime-950/40 text-white font-bold animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.2)]">10</div>
                        {/* More Days */}
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">11</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">12</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">13</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">14</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900 text-yellow-400 border-yellow-500/30">15</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">16</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">17</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">18</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">19</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">20</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">21</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">22</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">23</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">24</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">25</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">26</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">27</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">28</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">29</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">30</div>
                        <div className="p-2 border border-zinc-800 rounded bg-zinc-900">31</div>
                        <div className="p-2 border border-zinc-900/50 rounded bg-zinc-950/30"></div>
                      </div>
                    </div>

                    {/* Bottom Component (Active Shows & Drafts Directory) */}
                    <div className="w-full bg-zinc-900/30 border border-zinc-900 rounded-xl p-3.5 space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-lg font-mono text-[11px]">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                          <span className="text-zinc-200 font-bold uppercase truncate">Texas Chainsaw Fest</span>
                          <span className="text-zinc-500">//</span>
                          <span className="text-lime-400 font-bold">July 10, 2026</span>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-2">
                          <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-black">Status:</span>
                          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Draft</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-lg font-mono text-[11px]">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                          <span className="text-zinc-200 font-bold uppercase truncate">Neon Desert Night</span>
                          <span className="text-zinc-500">//</span>
                          <span className="text-lime-400 font-bold">July 15, 2026</span>
                        </div>
                        <div className="mt-2 sm:mt-0 flex items-center gap-2">
                          <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-black">Status:</span>
                          <span className="bg-lime-500/20 text-lime-400 border border-lime-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Confirmed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Regional Routing Control Room */}
                {subTab === 'regional' && (
                  <div className="space-y-4">
                    {/* Upper Tier: Talent Availability Tracker */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-center">
                      <div className="flex-1 w-full">
                        <label className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-1 block">Band Lookup</label>
                        <input type="text" placeholder="Search touring acts..." className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-lime-500" />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-1 block">Schedule Range</label>
                        <input type="date" defaultValue="2026-07-09" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-lime-500" />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-1 block">Geo Filter</label>
                        <select className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-lime-500">
                          <option>Las Vegas, NV</option>
                          <option>Los Angeles, CA</option>
                          <option>Phoenix, AZ</option>
                          <option>Denver, CO</option>
                        </select>
                      </div>
                    </div>

                    {/* Lower Tier: Active Routing Dock */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {/* Left Panel: Regional Tracking List */}
                      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-3.5 h-[300px] overflow-y-auto space-y-2">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 mt-1">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-mono font-bold text-xs uppercase tracking-wide truncate">Vibrant Fraction</h5>
                            <span className="bg-purple-900/30 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap">Touring</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 space-y-1">
                            <div className="flex justify-between"><span className="uppercase font-bold">Range:</span> <span className="text-zinc-300">Jul 12 - Jul 18</span></div>
                            <div className="flex justify-between"><span className="uppercase font-bold">Geo:</span> <span className="text-lime-400">Las Vegas Route</span></div>
                          </div>
                          <button className="w-full mt-2 bg-lime-950/30 border border-lime-500/40 hover:bg-lime-900/50 text-lime-400 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all">
                            Send Booking Proposal
                          </button>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-mono font-bold text-xs uppercase tracking-wide truncate">Neon Abyss</h5>
                            <span className="bg-lime-900/30 text-lime-400 border border-lime-500/30 px-2 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap">Available</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 space-y-1">
                            <div className="flex justify-between"><span className="uppercase font-bold">Range:</span> <span className="text-zinc-300">Jul 20 - Jul 25</span></div>
                            <div className="flex justify-between"><span className="uppercase font-bold">Geo:</span> <span className="text-lime-400">Las Vegas Route</span></div>
                          </div>
                          <button className="w-full mt-2 bg-lime-950/30 border border-lime-500/40 hover:bg-lime-900/50 text-lime-400 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all">
                            Send Booking Proposal
                          </button>
                        </div>
                      </div>

                      {/* Right Panel: Localized Vector Mapping */}
                      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 h-[300px] relative overflow-hidden flex flex-col">
                        <div className="flex-1 relative rounded-lg border border-zinc-800 overflow-hidden bg-[#0c0e12]">
                           {/* Vector Map Background pattern */}
                           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
                           
                           {/* Map Lines and Nodes */}
                           <svg className="absolute inset-0 w-full h-full">
                             <path d="M 50 150 Q 150 100 250 180 T 400 120" fill="none" stroke="#a3e635" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                             
                             <circle cx="50" cy="150" r="4" fill="#a3e635" className="animate-ping" />
                             <circle cx="50" cy="150" r="3" fill="#bef264" />
                             <text x="40" y="140" fill="#a3e635" fontSize="10" fontFamily="monospace" fontWeight="bold">LAX</text>

                             <circle cx="250" cy="180" r="5" fill="#d946ef" className="animate-pulse" />
                             <circle cx="250" cy="180" r="3" fill="#f0abfc" />
                             <text x="235" y="170" fill="#d946ef" fontSize="10" fontFamily="monospace" fontWeight="bold">LAS VEGAS (HQ)</text>

                             <circle cx="400" cy="120" r="4" fill="#a3e635" />
                             <text x="390" y="110" fill="#a3e635" fontSize="10" fontFamily="monospace" fontWeight="bold">PHX</text>
                           </svg>
                           
                           {/* Map Overlay Text */}
                           <div className="absolute bottom-3 left-3 text-[9px] font-mono uppercase font-black text-lime-400 bg-black/60 px-2 py-1 rounded border border-lime-500/30 backdrop-blur">
                             Live Network: NV / CA / AZ
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>"""

start_marker = r"\{\/\* TWO COLUMN INTERACTIVE LAYOUT \(MIGRATED FROM V1 HUB\) \*\/\}"
end_marker = r"\{\/\* SOCIAL TAB RENDERING \*\/\}"

pattern = re.compile(f"(.*?{start_marker}.*?\n).*?(\n\s*{end_marker}.*)", re.DOTALL)
match = pattern.search(content)

if match:
    # Need to keep the closing brace and parenthesis of activeTab === 'ROUTING' && ( ... )
    # Wait, the end of the replaced chunk was:
    #               </div>
    #             </div>
    #           )}
    # 
    #           {/* SOCIAL TAB RENDERING */}
    # So I should just replace from start_marker to the line before `)}`
    pass

# Better approach: string splitting and index search
lines = content.split('\n')
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{/* TWO COLUMN INTERACTIVE LAYOUT (MIGRATED FROM V1 HUB) */}" in line:
        start_idx = i
    if "{/* SOCIAL TAB RENDERING */}" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    # We need to find the `)}` that closes the ROUTING tab.
    # It should be right before end_idx
    close_idx = -1
    for i in range(end_idx - 1, start_idx, -1):
        if ")}" in lines[i]:
            close_idx = i
            break
    
    if close_idx != -1:
        # Reconstruct
        prefix = '\n'.join(lines[:start_idx])
        suffix = '\n'.join(lines[close_idx:]) # includes the )}`
        
        new_file_content = prefix + '\n' + new_content + '\n' + suffix
        
        with open("src/components/PromoterDashboardViewV2.tsx", "w") as f:
            f.write(new_file_content)
        print("Success")
    else:
        print("Could not find closing )}")
else:
    print("Could not find markers")
