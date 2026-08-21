const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

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

if (oldTabsBlock && oldTabsBlock.length > 0) {
  updatedContent = content.replace(oldTabsBlock, newTabsBlock);
  fs.writeFileSync('src/components/UniversalSocialFeed.tsx', updatedContent);
  console.log("Successfully updated tabs!");
} else {
  console.log("Failed to find tabs block");
}
