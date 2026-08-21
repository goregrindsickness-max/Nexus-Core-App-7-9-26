import fs from 'fs';

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const oldHeaderRegex = /\{\/\* HEADER SECTION METADATA \*\/\}([\s\S]*?)<div className="w-full flex items-center justify-center min-h-\[140px\] relative overflow-hidden mt-2">([\s\S]*?)<\/AnimatePresence>\s*<\/div>\s*<\/div>/;

const replacement = `{/* HEADER SECTION METADATA */}
      <div className="relative border-b border-[#1b1e25] pb-6 pt-6 flex flex-col items-center justify-center text-center bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-40 gap-4">
        
        {/* User Profile Avatar in Top Right */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white uppercase tracking-wider">{userProfile.name}</div>
            <div className="text-[9px] font-mono text-[#00ffcc] uppercase tracking-widest">{userProfile.role}</div>
          </div>
          <div 
            onClick={() => { setActiveEditTab('user'); setIsEditModalOpen(true); }}
            className="w-10 h-10 rounded-full border-2 border-[#00ffcc] overflow-hidden bg-zinc-950 cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-[#00ffcc]/10"
            title="Edit User Profile"
          >
            {userProfile.avatar_url ? (
              <img src={userProfile.avatar_url} alt={userProfile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#00ffcc] to-emerald-600 flex items-center justify-center text-black text-sm font-black font-display">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Centered Title Lockup */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h1 
              className="text-3xl md:text-5xl font-display font-medium tracking-tight text-white uppercase text-center select-text leading-none"
              style={{
                textShadow: '0 0 12px rgba(14, 165, 233, 0.4), 0 0 25px rgba(2, 132, 199, 0.35), 0 0 50px rgba(125, 211, 252, 0.2)',
                letterSpacing: '0.1em',
                fontWeight: 950,
                fontSize: '26px',
                marginLeft: '0px',
                marginTop: '0px'
              }}
            >
              Settings
            </h1>
          </motion.div>
          <p 
            className="text-xs md:text-sm text-zinc-400 font-mono tracking-wide max-w-xl leading-relaxed text-center"
            style={{ marginTop: '-6px', fontSize: '11px' }}
          >
            Configure band roster options, establish system environment parameters, toggle 24-hour clocks, and backup database structures.
          </p>
        </div>
      </div>

      {/* BAND PROFILE CARD */}
      <div className="w-full p-4 sm:p-6">
        <div className="backdrop-blur-md rounded-[calc(1.5rem-2.2px)] bg-[#090b0e]/95 flex flex-col items-center justify-between gap-6 relative overflow-hidden p-8 w-full animate-fade-in border border-[#a855f7]/20 shadow-2xl shadow-[#a855f7]/5" id="band-profile-card">
          <div className="absolute inset-0 bg-[radial-gradient(#a855f707_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-75 pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#a855f7]/5 blur-[90px] pointer-events-none" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2.5 z-20">
            <button 
              type="button"
              onClick={() => { setActiveEditTab('band'); setIsEditModalOpen(true); }}
              className="bg-zinc-950/60 hover:bg-zinc-850 border border-zinc-800 hover:border-[#a855f7] text-[#a855f7]/90 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-black group"
              title="REDEFINE BAND SPECS"
            >
              <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            </button>
            <span className="text-[8px] font-mono text-zinc-550 border border-zinc-900 bg-black/45 px-1.5 py-0.5 rounded animate-pulse">
              LIVE SYNC
            </span>
          </div>

          <div className="absolute top-4 left-4 z-20">
            <span className="bg-[#1a0c2c]/80 border border-[#a855f7]/30 text-[#a855f7] px-2.5 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase font-bold">
              ARTIST ROSTER
            </span>
          </div>

          {/* Central Column Profile Avatar & Visual details */}
          <div className="flex max-w-7xl flex-col items-center gap-5 text-center relative z-10 w-full animate-fade-in mt-2">
            <div 
              className="relative group shrink-0 cursor-pointer mx-auto" 
              title="Click to edit artist details"
              onClick={() => { setActiveEditTab('band'); setIsEditModalOpen(true); }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#e9d5ff] rounded-full blur opacity-65 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-zinc-950 overflow-hidden border border-zinc-900/85 flex items-center justify-center shadow-lg group-hover:border-[#a855f7] transition-colors">
                {activeBand?.logo_url ? (
                  <img 
                    src={activeBand?.logo_url} 
                    alt={activeBand?.name} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-350" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#3b0764] to-[#a855f7] flex items-center justify-center text-white text-4xl font-black font-display transition-transform group-hover:scale-110">
                    {activeBand?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] font-mono font-bold text-white uppercase bg-black/80 px-1.5 py-1 rounded border border-[#a855f7]/30">Edit Details</span>
                </div>
              </div>
            </div>

            {/* Specifications Stack */}
            <div className="flex flex-col items-center text-center space-y-3 w-full">
              <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white flex items-center justify-center gap-2">
                <span>{activeBand?.name || 'Managed Artist'}</span>
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-mono w-full">
                <div className="uppercase bg-zinc-950/60 px-3.5 py-1.5 rounded-xl border border-zinc-900/50 font-bold text-purple-400">
                  {activeBand?.genre || 'Alternative'}
                </div>

                <span className="hidden sm:inline text-zinc-800 font-black">•</span>

                <div className="text-xs text-zinc-350 font-mono flex items-center justify-center gap-1.5 p-1.5 px-3 bg-[#101319]/80 border border-zinc-900/80 rounded-xl shrink-0">
                  <span className="text-zinc-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#a855f7]" /> {activeBand?.homebase || 'Los Angeles, CA'}
                  </span>
                </div>

                <span className="hidden sm:inline text-zinc-800 font-black">•</span>

                <div className="flex items-center gap-1.5 text-zinc-450 bg-zinc-950/40 px-3 py-1.5 rounded-xl border border-zinc-900/50">
                  <span className="text-[#00ffcc] font-black flex items-center gap-1.5 uppercase tracking-wide animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffcc] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffcc]"></span>
                    </span>
                    SYNCED TO NEXUS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

if(oldHeaderRegex.test(content)) {
  content = content.replace(oldHeaderRegex, replacement);
  fs.writeFileSync('src/components/SettingsView.tsx', content);
  console.log("Successfully replaced the profile container.");
} else {
  console.log("Could not find the regex match.");
}
