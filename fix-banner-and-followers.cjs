const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const oldSection = `                  {/* ACTIVE PIT/RITUAL PORTAL STATE OR SCROLLING BANNER */}
                  <div className={\`mt-2 flex items-center gap-2 border rounded-lg overflow-hidden \${
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
                  </div>
                  {/* Stats Ledger Row MOVED HERE */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 border border-purple-950/40 rounded-xl p-3 mt-4 text-center">
                    <div 
                      onClick={() => setViewingFollowersOrFollowing('followers')}
                      className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                    >
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Followers</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followersCount || 0).toLocaleString()}</div>
                    </div>
                    <div 
                      onClick={() => setViewingFollowersOrFollowing('following')}
                      className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                    >
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Following</div>
                      <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followingCount || 0).toLocaleString()}</div>
                    </div>
                    <div className="p-1">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Reputation</div>
                      <div className="text-sm font-black text-purple-400 font-mono mt-0.5 shadow-sm">{(selectedUserProfile.sharesCount || 0).toLocaleString()}</div>
                    </div>
                  </div>`;

const newSection = `                  {/* ACTIVE PIT/RITUAL PORTAL STATE OR SCROLLING BANNER */}
                  <div className="mt-2 w-full relative flex items-center overflow-hidden bg-purple-950/20 border border-purple-500/30 rounded-xl py-2 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <span className="absolute left-3 z-10 flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-purple-400"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                    </span>
                    {/* Gradient masks for smooth scrolling fade */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0b0c0e] to-transparent z-[5]" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0b0c0e] to-transparent z-[5]" />
                    <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] ml-6 items-center">
                      <span className="text-[10px] font-mono font-black tracking-widest uppercase text-purple-400 px-4 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)] flex items-center gap-2">
                        📡 LATEST UPDATE: {selectedUserProfile.role.toLowerCase().includes('label') ? \`ROSTER TICKER: \${labelRosterTicker}\` : "Currently navigating the Nexus network. Signal Acquired."}
                      </span>
                      <span className="text-[10px] font-mono font-black tracking-widest uppercase text-purple-400 px-4 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)] flex items-center gap-2">
                        📡 LATEST UPDATE: {selectedUserProfile.role.toLowerCase().includes('label') ? \`ROSTER TICKER: \${labelRosterTicker}\` : "Currently navigating the Nexus network. Signal Acquired."}
                      </span>
                    </div>
                  </div>
                  
                  {/* Stats Ledger Row MOVED HERE */}
                  <div className="relative bg-zinc-950/60 border border-purple-950/40 rounded-xl p-3 mt-4 text-center group/ledger">
                    <div className="grid grid-cols-3 gap-2">
                      <div 
                        onClick={() => setViewingFollowersOrFollowing('followers')}
                        className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                      >
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Followers</div>
                        <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followersCount || 0).toLocaleString()}</div>
                      </div>
                      <div 
                        onClick={() => setViewingFollowersOrFollowing('following')}
                        className="hover:bg-purple-950/20 rounded-lg p-1 transition-all cursor-pointer group/stat border border-transparent hover:border-purple-500/20"
                      >
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest group-hover/stat:text-purple-400 transition-colors">Following</div>
                        <div className="text-sm font-black text-white font-mono mt-0.5 group-hover/stat:scale-105 transition-transform">{(selectedUserProfile.followingCount || 0).toLocaleString()}</div>
                      </div>
                      <div className="p-1">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Reputation</div>
                        <div className="text-sm font-black text-purple-400 font-mono mt-0.5 shadow-sm">{(selectedUserProfile.sharesCount || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 left-0 right-0 text-center opacity-0 group-hover/ledger:opacity-100 transition-opacity">
                      <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-mono">Click to see all followers</span>
                    </div>
                  </div>`;

code = code.replace(oldSection, newSection);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
console.log("Banner and Followers fixed");
