import re

with open('src/components/social/modals/PublicProfileModal.tsx', 'r') as f:
    content = f.read()

pattern = r"                          const isBandProfile = r\.includes\('artist'\) \|\| r\.includes\('band'\);\n                          const isUnlinked = isBandProfile && \(ap as any\)\.activated === false;.*?</button>\n                          \);"

replacement = """                          const isBandProfile = r.includes('artist') || r.includes('band');
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

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/social/modals/PublicProfileModal.tsx', 'w') as f:
    f.write(new_content)

if new_content == content:
    print("NO MATCH")
else:
    print("MATCH AND REPLACE SUCCESSFUL")
