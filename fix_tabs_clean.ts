import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startTag = "{/* Profile Tabs Navigation */}";
const endTag = "{/* Profile Tabs Content */}";

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{/* Profile Tabs Navigation */}
                {(() => {
                  const r = selectedUserProfile.role.toLowerCase();
                  const isArtist = r.includes('artist') || r.includes('band');
                  const isLabel = r.includes('label');
                  const isPromoter = r.includes('promoter');
                  const isCreative = r.includes('creative');

                  let tabButtons = [];
                  if (isArtist || isLabel) {
                    tabButtons = [
                      { id: 'timeline', label: 'TIMELINE', icon: <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'music', label: 'MUSIC', icon: <Disc className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'gallery', label: 'PHOTO PIT', icon: <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'shop', label: 'MERCH', icon: <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> }
                    ];
                  } else if (isPromoter) {
                    tabButtons = [
                      { id: 'timeline', label: 'TIMELINE', icon: <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'gallery', label: 'PHOTO PIT', icon: <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'tickets', label: 'TICKETS', icon: <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> }
                    ];
                  } else if (isCreative) {
                    tabButtons = [
                      { id: 'timeline', label: 'TIMELINE', icon: <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'portfolio', label: 'PORTFOLIO', icon: <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'gallery', label: 'PHOTO PIT', icon: <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> }
                    ];
                  } else {
                    tabButtons = [
                      { id: 'timeline', label: 'TIMELINE', icon: <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'gallery', label: 'PHOTO PIT', icon: <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> },
                      { id: 'collection', label: 'COLLECTION', icon: <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> }
                    ];
                  }

                  return (
                    <div className="mt-6 flex items-center justify-around border-b border-zinc-800 bg-zinc-950/60 p-1 sm:p-2 w-full gap-1">
                      {tabButtons.map(tab => {
                        const isActive = profileActiveTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setProfileActiveTab(tab.id)}
                            className={\`flex items-center justify-center space-x-1.5 sm:space-x-2 px-1.5 sm:px-3 py-3 sm:py-2.5 text-[12px] sm:text-xs font-bold tracking-tight sm:tracking-wider uppercase transition-all border-b-2 flex-1 text-center shrink \${
                              isActive
                                ? 'border-cyan-500 text-cyan-400 shadow-[0_10px_15px_-3px_rgba(6,182,212,0.2)]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }\`}
                          >
                            {tab.icon}
                            <span className="truncate">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}\n                `;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Replaced cleanly!");
} else {
  console.log("Tags not found");
}
