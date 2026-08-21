const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                            {/* Active Profile Info */}
                            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
                              <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/90 overflow-hidden flex items-center justify-center font-bold text-[#39ff14] text-sm font-mono uppercase">
                                {userProfile?.avatar_url ? (
                                  <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                ) : (
                                  userProfile?.name?.substring(0, 2) || "ME"
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-xs font-black text-zinc-100 truncate uppercase tracking-tight">{userProfile?.name || 'Nexus Commander'}</p>
                                <p className="text-[8.5px] text-zinc-500 font-mono truncate">{userProfile?.email || 'core@nexus.live'}</p>
                              </div>
                              <span className="bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] text-[8px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider shrink-0">
                                {userProfile?.role || 'ARTIST'}
                              </span>
                            </div>`;

const replacement = `                            {/* Active Profile Info */}
                            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800/80">
                              <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/90 overflow-hidden flex items-center justify-center font-bold text-[#39ff14] text-sm font-mono uppercase">
                                {(activeTab !== 'social' && activeTab !== 'reports' && activeTab !== 'creatives-hub' && activeBand?.logo_url) ? (
                                  <img src={activeBand.logo_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                ) : userProfile?.avatar_url ? (
                                  <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                ) : (
                                  (activeTab !== 'social' && activeTab !== 'reports' && activeTab !== 'creatives-hub' ? activeBand?.name : userProfile?.name)?.substring(0, 2) || "ME"
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-xs font-black text-zinc-100 truncate uppercase tracking-tight">
                                  {activeTab === 'social' ? (userProfile?.name || 'Nexus Core Fan') 
                                   : activeTab === 'reports' ? (userProfile?.promoter_metadata?.brand_name || 'Promoter Gateway') 
                                   : activeTab === 'creatives-hub' ? (userProfile?.creative_metadata?.business_name || 'Creative Hub') 
                                   : (activeBand?.name || userProfile?.bandName || 'Nexus Commander')}
                                </p>
                                <p className="text-[8.5px] text-zinc-500 font-mono truncate">
                                  {activeTab === 'social' ? (userProfile?.email || 'core@nexus.live') 
                                   : activeTab === 'reports' ? '@' + (userProfile?.promoter_metadata?.brand_name || '').toLowerCase().replace(/\\s+/g, '') 
                                   : activeTab === 'creatives-hub' ? '@' + (userProfile?.creative_metadata?.business_name || '').toLowerCase().replace(/\\s+/g, '') 
                                   : '@' + (activeBand?.name || userProfile?.bandName || '').toLowerCase().replace(/\\s+/g, '')}
                                </p>
                              </div>
                              <span className="bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] text-[8px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider shrink-0">
                                {activeTab === 'social' ? 'FAN' 
                                 : activeTab === 'reports' ? 'PROMOTER' 
                                 : activeTab === 'creatives-hub' ? 'CREATIVE' 
                                 : (userProfile?.role || 'ARTIST')}
                              </span>
                            </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patch 9 applied!');
} else {
  console.log('Target 9 not found!');
}
