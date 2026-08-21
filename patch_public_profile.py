import re

with open('src/components/social/modals/PublicProfileModal.tsx', 'r') as f:
    content = f.read()

# 1. Remove the "My Genres" text, display genres as plain text with music note icon on one line
genre_block = """                    return (
                      <div className="mt-2.5 mb-1 flex items-center text-zinc-400 text-xs">
                        <Music className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-emerald-500" />
                        <div className="truncate">
                          {genresList.join(', ')}
                        </div>
                      </div>
                    );"""

# Replace the original genre render
content = re.sub(r'                    return \(\n                      <div className="mt-2\.5 mb-1">\n                        <div className="text-\[10px\] text-zinc-500 font-mono uppercase tracking-widest mb-1\.5">My Genres</div>\n                        <div className="flex flex-wrap gap-1\.5">.*?</div>\n                      </div>\n                    \);', genre_block, content, flags=re.DOTALL)

# 2. Lineup click handling
old_lineup = """                          const r = (selectedUserProfile?.role || '').toLowerCase();
                          const isBandProfile = r.includes('artist') || r.includes('band');
                          const isUnlinked = isBandProfile && (ap as any).activated === false;

                          if (isUnlinked) {
                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  triggerNotification?.(`🔒 ${ap?.name} is not yet on Nexus Core. Invitation pending.`);
                                }}
                                className="flex items-center gap-2 bg-zinc-950/20 border border-dashed border-zinc-800 opacity-40 grayscale px-2.5 py-1.5 rounded-lg transition-all cursor-not-allowed group text-left select-none"
                              >
                                <img src={ap?.avatar} alt={ap?.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                <div className="text-left min-w-0 flex-1">
                                  <div className="text-[10px] font-bold text-zinc-400 leading-none flex items-center justify-between gap-1">
                                    <span className="truncate">{ap?.name}</span>
                                    <span className="text-[8px] font-mono bg-zinc-900 px-1 py-0.5 rounded text-[8px] tracking-tighter shrink-0 text-zinc-500">PENDING</span>
                                  </div>
                                  <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-600 mt-0.5">{ap?.role}</div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                               key={i}
                               onClick={() => {
                                if ((selectedUserProfile?.role || '').toLowerCase().includes('label')) {
                                  setSelectedLabelBand(ap?.name);
                                }
                                const profileData = {
                                  name: ap?.name,
                                  avatar: ap?.avatar,
                                  role: ap?.role || 'Artist',
                                  isYou: false,
                                };
                                setSelectedUserProfile(getProfileForUser(profileData));
                              }}
                              className={`flex items-center gap-2 bg-zinc-950/60 hover:bg-zinc-900 border ${
                                (selectedUserProfile?.role || '').toLowerCase().includes('label') ? 'border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]' : 
                                 isBandProfile ? 'border-emerald-500/30 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]' : 
                                 'border-zinc-900 hover:border-zinc-700'
                              } px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group text-left`}
                            >
                              <img src={ap?.avatar} alt={ap?.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                              <div className="text-left min-w-0 flex-1">
                                <div className={`text-[10px] font-bold text-white leading-none transition-colors truncate ${
                                  (selectedUserProfile?.role || '').toLowerCase().includes('label') ? 'group-hover:text-orange-400' : 
                                   isBandProfile ? 'group-hover:text-emerald-400' : 
                                   'group-hover:text-rose-400'
                                }`}>{ap?.name}</div>
                                <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">{ap?.role}</div>
                              </div>
                            </button>
                          );"""

new_lineup = """                          const r = (selectedUserProfile?.role || '').toLowerCase();
                          const isBandProfile = r.includes('artist') || r.includes('band');
                          const isLabel = r.includes('label');
                          const realProfile = allProfiles.find(p => p.name?.toLowerCase() === ap?.name?.toLowerCase());
                          const isUnlinked = isBandProfile && !realProfile;

                          if (isUnlinked) {
                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  triggerNotification?.(`${ap?.name} has not joined Nexus Core yet`);
                                }}
                                className="flex items-center gap-2 bg-zinc-950/20 border border-dashed border-zinc-800 opacity-40 grayscale px-2.5 py-1.5 rounded-lg transition-all cursor-not-allowed group text-left select-none"
                              >
                                <img src={ap?.avatar} alt={ap?.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                <div className="text-left min-w-0 flex-1">
                                  <div className="text-[10px] font-bold text-zinc-400 leading-none flex items-center justify-between gap-1">
                                    <span className="truncate">{ap?.name}</span>
                                    <span className="text-[8px] font-mono bg-zinc-900 px-1 py-0.5 rounded text-[8px] tracking-tighter shrink-0 text-zinc-500">NOT JOINED</span>
                                  </div>
                                  <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-600 mt-0.5">{ap?.role}</div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                               key={i}
                               onClick={() => {
                                if (isLabel) {
                                  setSelectedLabelBand(ap?.name);
                                }
                                if (realProfile) {
                                  setSelectedUserProfile(realProfile);
                                } else {
                                  triggerNotification?.(`${ap?.name} has not joined Nexus Core yet`);
                                }
                              }}
                              className={`flex items-center gap-2 bg-zinc-950/60 hover:bg-zinc-900 border ${
                                isLabel ? 'border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]' : 
                                isBandProfile ? 'border-emerald-500/30 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]' : 
                                'border-zinc-900 hover:border-zinc-700'
                              } px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group text-left`}
                            >
                              <img src={realProfile?.avatar || ap?.avatar} alt={ap?.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                              <div className="text-left min-w-0 flex-1">
                                <div className={`text-[10px] font-bold text-white leading-none transition-colors truncate ${
                                  isLabel ? 'group-hover:text-orange-400' : 
                                   isBandProfile ? 'group-hover:text-emerald-400' : 
                                   'group-hover:text-rose-400'
                                }`}>{ap?.name}</div>
                                <div className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">{ap?.role}</div>
                              </div>
                            </button>
                          );"""

content = content.replace(old_lineup, new_lineup)

# 3. Tabs move
old_tabs_container = '                  <div className="mt-6 flex flex-wrap items-center justify-start sm:justify-around border-b border-zinc-800 bg-zinc-950/60 p-1 sm:p-2 w-full gap-1 sm:gap-2">'
new_tabs_container = '                  <div className="mt-6 flex flex-wrap items-center justify-start sm:justify-around border-b border-zinc-800 bg-zinc-950/60 p-1 sm:p-2 w-full gap-1 sm:gap-2 -ml-5 sm:ml-0">'
content = content.replace(old_tabs_container, new_tabs_container)

with open('src/components/social/modals/PublicProfileModal.tsx', 'w') as f:
    f.write(content)

