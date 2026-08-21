const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const oldStatus = `                  <div className={\`mt-4 rounded-xl flex items-center overflow-hidden border w-full \${
                    selectedUserProfile.role.toLowerCase().includes('label') 
                      ? 'bg-orange-950/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)] px-0 py-2' 
                      : 'bg-purple-950/10 border-purple-900/30 px-2.5 py-1.5'
                  }\`}>
                    {!selectedUserProfile.role.toLowerCase().includes('label') ? (
                      <>
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-purple-400\`}></span>
                          <span className={\`relative inline-flex rounded-full h-2 w-2 bg-purple-500\`}></span>
                        </span>
                        <span className={\`text-[9px] font-mono font-bold tracking-wider uppercase leading-none text-purple-400\`}>
                          {selectedUserProfile.role.toLowerCase().includes('artist') ? '💀 Co-op Node: IN COVEN REHEARSAL' :
                           selectedUserProfile.role.toLowerCase().includes('promoter') ? '🏟️ Arena Core: LIVE SOUNDCHECK ACTIVE' :
                           '🎧 PIT WARRIOR: SIGNAL ACQUIRED'}
                        </span>
                      </>
                    ) : (
                      <div className="w-full relative flex items-center overflow-hidden bg-orange-950/10 border border-orange-500/20 rounded-xl py-2 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
                        <span className="absolute left-3 z-10 flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-orange-500"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                        </span>
                        {/* Gradient masks for smooth scrolling fade */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0b0c0e] to-transparent z-[5]" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b0c0e] to-transparent z-[5]" />
                        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] ml-6 items-center">
                          <span className="text-[10px] font-mono font-black tracking-widest uppercase text-orange-400 px-4 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)] flex items-center gap-2">
                            🚨 ROSTER TICKER: {labelRosterTicker}
                          </span>
                          <span className="text-[10px] font-mono font-black tracking-widest uppercase text-orange-400 px-4 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)] flex items-center gap-2">
                            🚨 ROSTER TICKER: {labelRosterTicker}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>`;

const newStatus = `                  <div className={\`mt-4 rounded-xl flex items-center overflow-hidden border w-full \${
                    selectedUserProfile.role.toLowerCase().includes('label') 
                      ? 'bg-orange-950/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)] py-2' 
                      : 'bg-purple-950/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] py-2'
                  }\`}>
                      <div className="w-full relative flex items-center overflow-hidden">
                        <span className="absolute left-3 z-10 flex h-2.5 w-2.5 shrink-0">
                          <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${selectedUserProfile.role.toLowerCase().includes('label') ? 'bg-orange-500' : 'bg-purple-500'}\`}></span>
                          <span className={\`relative inline-flex rounded-full h-2.5 w-2.5 \${selectedUserProfile.role.toLowerCase().includes('label') ? 'bg-orange-500' : 'bg-purple-500'}\`}></span>
                        </span>
                        {/* Gradient masks for smooth scrolling fade */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0b0c0e] to-transparent z-[5]" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b0c0e] to-transparent z-[5]" />
                        
                        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] ml-6 items-center">
                          <span className={\`text-[10px] font-mono font-black tracking-widest uppercase px-4 flex items-center gap-2 \${selectedUserProfile.role.toLowerCase().includes('label') ? 'text-orange-400 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]' : 'text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]'}\`}>
                            🚨 {selectedUserProfile.role.toLowerCase().includes('label') ? \`ROSTER TICKER: \${labelRosterTicker}\` : 'STATUS UPDATE: SIGNAL ACQUIRED - NETWORK SYNC ACTIVE - SEARCHING FOR NEW LOCAL GIGS'}
                          </span>
                          <span className={\`text-[10px] font-mono font-black tracking-widest uppercase px-4 flex items-center gap-2 \${selectedUserProfile.role.toLowerCase().includes('label') ? 'text-orange-400 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]' : 'text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]'}\`}>
                            🚨 {selectedUserProfile.role.toLowerCase().includes('label') ? \`ROSTER TICKER: \${labelRosterTicker}\` : 'STATUS UPDATE: SIGNAL ACQUIRED - NETWORK SYNC ACTIVE - SEARCHING FOR NEW LOCAL GIGS'}
                          </span>
                        </div>
                      </div>
                  </div>`;

code = code.replace(oldStatus, newStatus);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
console.log("Status bar updated");
