const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

const startStr = 'return filteredItems.map((item) => {';
const endStr = '});\n                })()}';

const s = content.indexOf(startStr);
const e = content.indexOf(endStr, s);

if (s !== -1 && e !== -1) {
  const newCard = `return filteredItems.map((item) => {
                    const isPod = podItems[item.id] || false;
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => setEditingWarehouseItem(item as any)}
                        className="bg-[#0b0c0f] rounded-2xl relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl flex flex-col cursor-pointer border-[1.5px] border-zinc-800 hover:border-zinc-700 p-2 gap-3"
                        style={{ boxShadow: '0 4px 20px -5px rgba(0,255,204,0.05)' }}
                      >
                        <div className="absolute top-0 inset-x-0 h-1 pointer-events-none bg-[#00ffcc]" />

                        <div className="flex gap-3 h-[130px]">
                          <div className="w-24 h-full relative bg-zinc-900 rounded-lg overflow-hidden shrink-0">
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full ring-2 ring-black bg-[#00ffcc]" />
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-0.5 pr-1">
                            <div>
                              <h4 className="text-sm font-semibold text-white leading-tight font-sans tracking-tight line-clamp-2">
                                {item.name}
                              </h4>
                              <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">{item.item_type}</p>
                              <div className="mt-1 font-sans font-black text-[#00ffcc] tracking-tight">
                                \${(item.price || 0).toFixed(2)}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPodItems(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                }}
                                className={\`text-[9px] font-mono font-black uppercase px-2 py-1 rounded transition-colors border \${isPod ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}\`}
                              >
                                {isPod ? 'POD ACTIVE' : 'ENABLE POD'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Second Row: Actions & Stats */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-zinc-950/40 px-2 py-1.5 rounded-lg border border-zinc-900/60 flex flex-col justify-center">
                            <span className="text-[9px] text-zinc-500 font-mono text-left block">
                              Table: <span className={\`font-bold \${isPod ? 'text-purple-400' : 'text-white'}\`}>{isPod ? '∞' : item.table_stock}</span>
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono text-left block mt-0.5">
                              Van: <span className={\`font-bold \${isPod ? 'text-purple-400' : 'text-zinc-300'}\`}>{isPod ? '∞' : item.van_stock}</span>
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRestockItemId(item.id);
                                const band = labelRosterData.find(b => b.id === item.bandId);
                                if (band) {
                                  setActiveRestockBand(band);
                                }
                              }}
                              className="w-full flex-1 bg-orange-600 hover:bg-orange-500 text-white text-[8px] font-mono font-black uppercase rounded border border-orange-500/50 transition-all text-center flex items-center justify-center cursor-pointer select-none"
                            >
                              SEND STOCK
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStorefrontSyncRecord(prev => {
                                  const newSync = !prev[item.id];
                                  showLocalToast(\`\${newSync ? 'STAGED' : 'UNSTAGED'} "\${item.name.toUpperCase()}" ON STOREFRONT\`);
                                  return { ...prev, [item.id]: newSync };
                                });
                              }}
                              className="w-full flex-1 flex items-center justify-center bg-zinc-900/80 hover:bg-[#39ff14]/10 border border-zinc-850 hover:border-[#39ff14]/30 text-[#39ff14] text-[8px] font-mono font-black uppercase rounded transition-all text-center cursor-pointer select-none"
                            >
                              🚀 STOREFRONT
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  `;
  
  content = content.substring(0, s) + newCard + content.substring(e);
  fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
  console.log('Successfully replaced cards!');
} else {
  console.log('Could not find start or end str');
}
