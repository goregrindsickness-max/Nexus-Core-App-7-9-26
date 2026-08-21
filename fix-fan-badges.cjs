const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const oldOverlay = `                      return (
                        <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded-full border mb-2 \${
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
                           ''}
                        </span>
                      );
                    })()}
                  </div>`;

const newOverlay = `                      if (selectedUserProfile.customBadges && selectedUserProfile.customBadges.length > 0) {
                        return (
                          <div className="flex flex-col gap-1 mb-2">
                            {selectedUserProfile.customBadges.map((badge, idx) => (
                              <span key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-rose-950/90 text-rose-400 border-rose-900/50 whitespace-nowrap">
                                {badge}
                              </span>
                            ))}
                          </div>
                        );
                      }

                      const defaultText = r.includes('artist') || r.includes('band') ? '💀 Artist' : 
                           r.includes('promoter') ? '🏟️ Venue' : 
                           r.includes('label') ? '💿 Label' : 
                           r.includes('creative') ? '🎨 Creative' :
                           '';

                      if (!defaultText) return null;

                      return (
                        <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded-full border mb-2 \${
                          r.includes('artist') || r.includes('band') ? 'bg-emerald-950/90 text-emerald-400 border-emerald-900/50' :
                          r.includes('promoter') ? 'bg-yellow-950/90 text-yellow-400 border-yellow-900/50' :
                          r.includes('label') ? 'bg-orange-950/90 text-orange-400 border-orange-900/50' :
                          r.includes('creative') ? 'bg-fuchsia-950/90 text-fuchsia-400 border-fuchsia-900/50' :
                          isPro ? 'bg-purple-950/90 text-purple-400 border-purple-900/50' :
                          'bg-blue-950/90 text-blue-400 border-blue-900/50'
                        }\`}>
                          {defaultText}
                        </span>
                      );
                    })()}
                  </div>`;

code = code.replace(oldOverlay, newOverlay);

const oldCustomBadgesBelow = `                                    {/* Custom badges */}
                  {selectedUserProfile.customBadges && selectedUserProfile.customBadges.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedUserProfile.customBadges
                        .filter(badge => {
                          if (selectedUserProfile.role.toLowerCase().includes('label')) {
                            return !badge.toLowerCase().includes('overlord') && !badge.toLowerCase().includes('founder');
                          }
                          return true;
                        })
                        .map((badge, idx) => (
                          <span key={idx} className={\`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-widest \${
                            selectedUserProfile.role.toLowerCase().includes('label') 
                              ? 'bg-orange-500/5 text-orange-400 border border-orange-950' 
                              : 'bg-rose-500/5 text-rose-400 border border-rose-950'
                          }\`}>
                            {badge}
                          </span>
                        ))}
                    </div>
                  )}`;

code = code.replace(oldCustomBadgesBelow, `{/* Custom badges moved to avatar overlay */}`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
console.log("Fan badges fixed");
