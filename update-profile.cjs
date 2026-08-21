const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// 1. Dynamic Role-Based Theme Engine Matrix for Root Profile Container
const oldRootClass = 'className={`relative w-full max-w-md bg-[#0b0c0e] rounded-2xl overflow-hidden shrink-0 transition-all border-2 ${';
const newRootClass = 'className={`relative w-full max-w-md bg-[#0b0c0e] rounded-2xl overflow-hidden shrink-0 transition-all border-2 ${';
// Wait, I will just replace the condition block for the container border/shadows.
// Let's find the exact block.
const containerStyleStart = `                selectedUserProfile.role.toLowerCase().includes('label')`;
const containerStyleEnd = `                  : 'border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.25)]'`;

const newContainerStyle = `                (() => {
                  const r = selectedUserProfile.role.toLowerCase();
                  const isPro = selectedUserProfile.hasProAccess || selectedUserProfile.isYou;
                  if (r.includes('artist') || r.includes('band')) return 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]';
                  if (r.includes('promoter')) return 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.08)]';
                  if (r.includes('label')) return 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.08)]';
                  if (r.includes('creative')) return 'border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.08)]';
                  if (isPro) return 'border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.08)] bg-gradient-to-b from-zinc-900 to-neutral-950';
                  return 'border-blue-500/20 bg-zinc-950/40 shadow-none';
                })()`;

// 2. Avatar Border Colors
const avatarBorderStart = `                      selectedUserProfile.role.toLowerCase().includes('artist') ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' :`;
const avatarBorderEnd = `                      'border-zinc-700 shadow-lg'`;
const newAvatarBorder = `                      (() => {
                        const r = selectedUserProfile.role.toLowerCase();
                        if (r.includes('artist') || r.includes('band')) return 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-emerald-400';
                        if (r.includes('promoter')) return 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] text-yellow-400';
                        if (r.includes('label')) return 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] text-orange-400';
                        if (r.includes('creative')) return 'border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.4)] text-fuchsia-400';
                        if (selectedUserProfile.hasProAccess || selectedUserProfile.isYou) return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] text-purple-400';
                        return 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] text-blue-400';
                      })()`;

// 3. Role Badge Escalation
const roleBadgeStart = `                    {/* Role badge overlay */}`;
const roleBadgeEnd = `                    </span>`;
const oldRoleBadgeBlock = content.substring(content.indexOf(roleBadgeStart), content.indexOf(roleBadgeEnd) + roleBadgeEnd.length);

const newRoleBadgeBlock = `                    {/* Role badge overlay */}
                    {(() => {
                      const isPro = selectedUserProfile.hasProAccess || selectedUserProfile.isYou;
                      const r = selectedUserProfile.role.toLowerCase();
                      
                      if (isPro && (!r.includes('artist') && !r.includes('band') && !r.includes('promoter') && !r.includes('label') && !r.includes('creative'))) {
                        return (
                          <span className="absolute -bottom-1 -right-1 text-[10px] font-mono bg-purple-950/40 border border-purple-500/30 text-purple-300 font-bold px-2 py-0.5 rounded">
                            {r.includes('operator') ? '⚡ OPERATOR' : '🛠️ DEVELOPER'}
                          </span>
                        );
                      }

                      return (
                        <span className={\`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border \${
                          r.includes('artist') || r.includes('band') ? 'bg-emerald-950/90 text-emerald-400 border-emerald-900/50' :
                          r.includes('promoter') ? 'bg-yellow-950/90 text-yellow-400 border-yellow-900/50' :
                          r.includes('label') ? 'bg-orange-950/90 text-orange-400 border-orange-900/50' :
                          r.includes('creative') ? 'bg-fuchsia-950/90 text-fuchsia-400 border-fuchsia-900/50' :
                          isPro ? 'bg-purple-950/90 text-purple-400 border-purple-900/50' :
                          'bg-blue-950/90 text-blue-400 border-blue-900/50'
                        }\`}>
                          {r.includes('artist') || r.includes('band') ? '💀 Artist' : 
                           r.includes('promoter') ? '🏟️ Venue' : 
                           r.includes('label') ? '💿 Label' : 
                           r.includes('creative') ? '🎨 Creative' :
                           '🎧 Fan'}
                        </span>
                      );
                    })()}`;

// 4. Linked Nodes -> Managed Hubs & Workspaces
const linkedNodesOld = `                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono flex items-center gap-1.5">
                        {selectedUserProfile.role.toLowerCase().includes('label') ? (
                          <><Users className="w-3.5 h-3.5 text-orange-400" /> Label Roster</>
                        ) : (
                          <><LinkIcon className="w-3.5 h-3.5 text-zinc-400" /> Linked Nodes</>
                        )}
                      </h3>`;
const linkedNodesNew = `                      <div className="flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono flex items-center gap-1.5">
                          {selectedUserProfile.role.toLowerCase().includes('label') ? (
                            <><Users className="w-3.5 h-3.5 text-orange-400" /> Label Roster</>
                          ) : (
                            <><Network className="w-3.5 h-3.5 text-zinc-400" /> 📡 Managed Hubs & Workspaces</>
                          )}
                        </h3>
                        {!selectedUserProfile.role.toLowerCase().includes('label') && (
                          <p className="text-[11px] font-mono text-zinc-500 italic mt-0.5">// Primary administrative ties and active operational projects.</p>
                        )}
                      </div>`;

// 5. Vibe Endorsements -> Professional Artist EPK Matrix OR Personal Sonic Footprint
const vibeStart = `                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono mb-2 flex items-center gap-1 flex-wrap">
                      <Award className="w-3.5 h-3.5 text-purple-500" />
                      Vibe Endorsements
                    </h3>`;
const vibeNew = `                    {(() => {
                      const r = selectedUserProfile.role.toLowerCase();
                      const isArtist = r.includes('artist') || r.includes('band');
                      
                      if (isArtist) {
                        return (
                          <>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono mb-2 flex items-center gap-1 flex-wrap">
                              <Award className="w-3.5 h-3.5 text-emerald-500" />
                              EPK Analytics Matrix
                            </h3>
                            <div className="grid grid-cols-2 gap-2 bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg">
                              <div className="flex flex-col justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Routing Status</span>
                                <span className="text-zinc-400 text-xs mt-1">Active Tour Runs: 1 | Confirmed Dates: 12</span>
                              </div>
                              <button 
                                onClick={() => triggerNotification?.("Booking request dispatched to agent.")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs py-2 rounded transition-colors"
                              >
                                📥 Request Booking / Advance
                              </button>
                            </div>
                          </>
                        );
                      }
                      
                      return (
                        <>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono mb-2 flex items-center gap-1 flex-wrap">
                            <Award className="w-3.5 h-3.5 text-purple-500" />
                            🔊 Personal Sonic Footprint
                          </h3>
`;

const visualBalanceStart = `                                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-500"`;
const visualBalanceNew = `                                className={\`h-full rounded-full transition-all duration-500 \${
                                  selectedUserProfile.role.toLowerCase().includes('promoter') ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                  selectedUserProfile.role.toLowerCase().includes('label') ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                                  selectedUserProfile.role.toLowerCase().includes('creative') ? 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-400' :
                                  (selectedUserProfile.hasProAccess || selectedUserProfile.isYou) ? 'bg-gradient-to-r from-purple-600 to-purple-400' :
                                  'bg-gradient-to-r from-blue-600 to-blue-400'
                                }\`}`;


// Now process string replacements
let updatedContent = content;

// Replace container border
let startIdx = updatedContent.indexOf(containerStyleStart);
let endIdx = updatedContent.indexOf(containerStyleEnd);
if (startIdx !== -1 && endIdx !== -1) {
  updatedContent = updatedContent.substring(0, startIdx) + newContainerStyle + updatedContent.substring(endIdx + containerStyleEnd.length);
} else {
  console.log("Failed to find container styles");
}

// Replace avatar border
startIdx = updatedContent.indexOf(avatarBorderStart);
endIdx = updatedContent.indexOf(avatarBorderEnd);
if (startIdx !== -1 && endIdx !== -1) {
  updatedContent = updatedContent.substring(0, startIdx) + newAvatarBorder + updatedContent.substring(endIdx + avatarBorderEnd.length);
} else {
  console.log("Failed to find avatar border");
}

// Replace role badge
if (oldRoleBadgeBlock && oldRoleBadgeBlock.length > 0) {
  updatedContent = updatedContent.replace(oldRoleBadgeBlock, newRoleBadgeBlock);
} else {
  console.log("Failed to find role badge block");
}

// Replace Linked Nodes
if (updatedContent.includes(linkedNodesOld)) {
  updatedContent = updatedContent.replace(linkedNodesOld, linkedNodesNew);
} else {
  console.log("Failed to find linked nodes");
}

// Replace Vibe Endorsements title
if (updatedContent.includes(vibeStart)) {
  updatedContent = updatedContent.replace(vibeStart, vibeNew);
  // Add closing bracket for the if(isArtist) logic right after the map closing bracket
  // we'll look for `                      })}
  //                    </div>`
  
  const closingBrackets = `                      })}
                    </div>`;
  if (updatedContent.includes(closingBrackets)) {
    updatedContent = updatedContent.replace(closingBrackets, `                      })}
                    </div>
                  </>
                );
              })()}`);
  }
} else {
  console.log("Failed to find vibe endorsements");
}

// Replace Visual Balance Bar colors
if (updatedContent.includes(visualBalanceStart)) {
  // It appears 4 times due to map, wait it's just one time inside the map
  updatedContent = updatedContent.replace(visualBalanceStart, visualBalanceNew);
} else {
  console.log("Failed to find visual balance bar");
}

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', updatedContent);
console.log("Successfully updated UniversalSocialFeed.tsx!");
