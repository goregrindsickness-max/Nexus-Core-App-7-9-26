const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// 1. Root Container Class
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
content = content.replace(content.substring(content.indexOf(containerStyleStart), content.indexOf(containerStyleEnd) + containerStyleEnd.length), newContainerStyle);

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
content = content.replace(content.substring(content.indexOf(avatarBorderStart), content.indexOf(avatarBorderEnd) + avatarBorderEnd.length), newAvatarBorder);


// 3. Role Badge Overlay
const roleBadgeStart = `                    {/* Role badge overlay */}`;
const roleBadgeEnd = `                    </span>`;
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
content = content.replace(content.substring(content.indexOf(roleBadgeStart), content.indexOf(roleBadgeEnd) + roleBadgeEnd.length), newRoleBadgeBlock);


// 4. Linked Nodes
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
content = content.replace(linkedNodesOld, linkedNodesNew);


// 5. Vibe Endorsements block
// I'll grab the whole <div className="mt-4"> which holds Vibe Endorsements to exactly where it ends.
const vibeDivStart = `                  <div className="mt-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono mb-2 flex items-center gap-1 flex-wrap">
                      <Award className="w-3.5 h-3.5 text-purple-500" />
                      Vibe Endorsements
                    </h3>
                    <div className="grid grid-cols-2 gap-2">`;
const vibeDivEndPattern = `                    </div>
                  </div>`;
const vibeDivStartIdx = content.indexOf(vibeDivStart);
const vibeDivEndIdx = content.indexOf(vibeDivEndPattern, vibeDivStartIdx) + vibeDivEndPattern.length;
const vibeBlock = content.substring(vibeDivStartIdx, vibeDivEndIdx);

const newVibeBlock = `                  <div className="mt-4">
                    {(() => {
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
                                className="bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs py-2 rounded transition-colors uppercase tracking-wider"
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
                          <div className="grid grid-cols-2 gap-2">
                            {['Heaviness', 'Atmosphere', 'Energy', 'Rawness'].map((category) => {
                              const lowerName = selectedUserProfile.name.toLowerCase();
                              const count = userEndorsements[lowerName]?.[category] || 12;
                              // Calculate progress percentage with max limit 500 for visual bars
                              const percentage = Math.min(100, Math.max(15, (count / 300) * 100));
                              
                              return (
                                <button
                                  key={category}
                                  onClick={() => {
                                    if (selectedUserProfile.isYou) {
                                      triggerNotification?.("You cannot endorse your own vibe terminals.");
                                      return;
                                    }
                                    setUserEndorsements(prev => {
                                      const userEnd = prev[lowerName] || { Heaviness: 12, Atmosphere: 12, Energy: 12, Rawness: 12 };
                                      return {
                                        ...prev,
                                        [lowerName]: {
                                          ...userEnd,
                                          [category]: userEnd[category] + 1
                                        }
                                      };
                                    });
                                    triggerNotification?.(\`Endorsed \${selectedUserProfile.name}'s \${category}!\`);
                                  }}
                                  className="flex flex-col p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-900 hover:border-purple-500/40 hover:bg-purple-950/5 text-left transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                >
                                  <div className="flex items-center justify-between w-full z-10">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                      <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider transition-colors">{category}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-purple-400 font-black">{count}</span>
                                  </div>
                                  
                                  {/* Visual Balance Bar */}
                                  <div className="w-full h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden z-10">
                                    <div 
                                      className={\`h-full rounded-full transition-all duration-500 \${
                                        selectedUserProfile.role.toLowerCase().includes('promoter') ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                        selectedUserProfile.role.toLowerCase().includes('label') ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                                        selectedUserProfile.role.toLowerCase().includes('creative') ? 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-400' :
                                        (selectedUserProfile.hasProAccess || selectedUserProfile.isYou) ? 'bg-gradient-to-r from-purple-600 to-purple-400' :
                                        'bg-gradient-to-r from-blue-600 to-blue-400'
                                      }\`}
                                      style={{ width: \`\${percentage}%\` }}
                                    />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>`;
content = content.replace(vibeBlock, newVibeBlock);

// 6. Tabs
const tabsStart = `                {/* Profile Tabs Navigation */}`;
const tabsEnd = `                {/* Profile Tabs Content */}`;

const oldTabsBlock = content.substring(content.indexOf(tabsStart), content.indexOf(tabsEnd));

const newTabsBlock = `                {/* Profile Tabs Navigation */}
                {(() => {
                  const r = selectedUserProfile.role.toLowerCase();
                  const isArtist = r.includes('artist') || r.includes('band');
                  const isPromoter = r.includes('promoter');
                  const isLabel = r.includes('label');
                  const isCreative = r.includes('creative');
                  const isPro = selectedUserProfile.hasProAccess || selectedUserProfile.isYou;
                  
                  const getTabColorClasses = (tabId) => {
                    const isActive = profileActiveTab === tabId;
                    if (!isActive) return 'text-zinc-500 hover:text-zinc-300';
                    if (isArtist) return 'text-emerald-500 border-b-2 border-emerald-500 font-black';
                    if (isPromoter) return 'text-yellow-500 border-b-2 border-yellow-500 font-black';
                    if (isLabel) return 'text-orange-500 border-b-2 border-orange-500 font-black';
                    if (isCreative) return 'text-fuchsia-500 border-b-2 border-fuchsia-500 font-black';
                    if (isPro) return 'text-purple-500 border-b-2 border-purple-500 font-black';
                    return 'text-blue-500 border-b-2 border-blue-500 font-black';
                  };

                  const commonTabClasses = isLabel ? 'text-xs md:text-sm uppercase tracking-wider' : 'text-[10px] uppercase tracking-widest';

                  return (
                    <div className={\`mt-6 border-b border-zinc-900/60 flex flex-wrap \${
                      isLabel ? 'justify-center gap-3 md:gap-4 w-full py-1' : 'gap-2.5 md:gap-4'
                    }\`}>
                      <button
                        onClick={() => setProfileActiveTab('timeline')}
                        className={\`pb-2 font-mono font-bold whitespace-nowrap transition-all \${commonTabClasses} \${getTabColorClasses('timeline')}\`}
                      >
                        Timeline
                      </button>
                      
                      {!isArtist && (
                        <button
                          onClick={() => setProfileActiveTab('gallery')}
                          className={\`pb-2 font-mono font-bold whitespace-nowrap transition-all \${commonTabClasses} \${getTabColorClasses('gallery')}\`}
                        >
                          Gallery
                        </button>
                      )}

                      {((selectedUserProfile.musicCatalog && selectedUserProfile.musicCatalog.length > 0) || isLabel || isArtist) && (
                        <button
                          onClick={() => setProfileActiveTab('music')}
                          className={\`pb-2 font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 \${commonTabClasses} \${getTabColorClasses('music')}\`}
                        >
                          <Disc className="w-3.5 h-3.5 shrink-0" /> Music
                        </button>
                      )}

                      {(isPro || isLabel || isArtist) && (
                        <button
                          onClick={() => setProfileActiveTab('shop')}
                          className={\`pb-2 font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 \${commonTabClasses} \${getTabColorClasses('shop')}\`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0" /> Merch
                        </button>
                      )}

                      {isArtist && (
                        <button
                          onClick={() => setProfileActiveTab('tour')}
                          className={\`pb-2 font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 \${commonTabClasses} \${getTabColorClasses('tour')}\`}
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> Tour Itinerary
                        </button>
                      )}
                    </div>
                  );
                })()}
`;
content = content.replace(oldTabsBlock, newTabsBlock);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Successfully updated the file!");
