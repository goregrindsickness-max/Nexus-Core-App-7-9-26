const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const oldTabs = `                  const commonTabClasses = isLabel ? 'text-xs md:text-sm uppercase tracking-wider' : 'text-[10px] uppercase tracking-widest';
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
                          <ShoppingCart className="w-3.5 h-3.5 shrink-0" /> Shop
                        </button>
                      )}`;

const newTabs = `                  const commonTabClasses = 'text-xs md:text-sm uppercase tracking-wider';
                  return (
                    <div className="mt-6 border-b border-zinc-900/60 flex flex-wrap justify-center gap-6 md:gap-8 w-full py-2">
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
                      )}`;

code = code.replace(oldTabs, newTabs);

const oldTopSong = `<div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">Current Top Song</div>`;
const newTopSong = `<div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">My Current Top Song</div>`;
code = code.replace(oldTopSong, newTopSong);

const oldManagedHubs = `<><Network className="w-3.5 h-3.5 text-zinc-400" /> 📡 Managed Hubs & Workspaces</>`;
const newManagedHubs = `<><Network className="w-3.5 h-3.5 text-zinc-400" /> 📡 Primary Ties & Active Projects</>`;
code = code.replace(oldManagedHubs, newManagedHubs);

const oldTiesList = `    : isYou ? [
      { name: 'Virulent Excision', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150' },
      { name: 'Devourment', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=150' },
      { name: 'Epicardiectomy', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=150' },
      { name: 'Pathology', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=150' },
      { name: 'Origin', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=150' },
      { name: 'Exhumed', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150' },
      { name: 'Incinerate', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=150' },
      { name: 'Stabbing', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=150' },
      { name: 'United Brutality Records', role: 'Label', avatar: 'https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?w=150' }
    ] : user.role.toLowerCase().includes('label') ? [`;

const newTiesList = `    : isYou ? [
      { name: 'Nexus Live Productions', role: 'Production', avatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150' },
      { name: 'Vortex Graphics', role: 'Creative', avatar: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=150' },
      { name: 'Virulent Excision', role: 'Artist', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150' },
      { name: 'United Brutality Records', role: 'Label', avatar: 'https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?w=150' }
    ] : user.role.toLowerCase().includes('label') ? [`;

code = code.replace(oldTiesList, newTiesList);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
console.log("Tabs and Ties updated");
