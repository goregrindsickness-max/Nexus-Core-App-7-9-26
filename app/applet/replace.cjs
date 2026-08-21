const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/LabelDashboardView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = "              {/* PUBLIC STOREFRONT THEME & LAYOUT CONFIGURATOR */}";
const endMarker = "              </>\n              )}\n            </div>\n          )}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers", startIndex, endIndex);
  process.exit(1);
}

// Extract specific blocks using index matching
// "PUBLIC STOREFRONT THEME & LAYOUT CONFIGURATOR"
const confStart = content.indexOf('<div className="bg-[#000000] border border-[#1A1A1A] rounded-xl p-6 space-y-6 shadow-xl relative overflow-hidden group">', startIndex);
const confEnd = content.indexOf('              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">', confStart);
let configuratorBlock = content.substring(confStart, confEnd).trim();

// "MERCHANDISE STOREFRONT CONTROL CONSOLE"
const controlStart = content.indexOf('<div className="space-y-6">\n                  {/* STOREFRONT CONFIGURATION HEADER */}', confEnd);
const controlEnd = content.indexOf('<div className="space-y-4">\n                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">\n                    <h3 className="text-xs font-black font-mono text-zinc-300 tracking-widest uppercase">DIRECT MAILORDER FULFILLMENT</h3>', controlStart);
let controlConsoleBlock = content.substring(controlStart, controlEnd).trim();

// Ensure controlConsoleBlock ends properly. It should end with closing div of space-y-6.
// Which means removing the trailing space if needed. We'll just use it directly.

const newStructure = `
              {/* LAYER 01: DIRECT MAILORDER FULFILLMENT */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3 border-b border-zinc-900 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black font-mono text-zinc-300 tracking-widest uppercase">DIRECT MAILORDER FULFILLMENT</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                        [ {storefrontOrders.filter(o => o.status === 'UNFULFILLED').length} UNFULFILLED ]
                      </span>
                      <span className="text-[9px] font-mono bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                        [ {storefrontOrders.filter(o => o.status !== 'UNFULFILLED').length} SHIPPED / TRACKING LOGGED ]
                      </span>
                    </div>
                  </div>
                  
                  {/* BATCH FULFILLMENT UTILITY BAR */}
                  <div className="bg-[#000000] border border-[#1A1A1A] rounded-xl p-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center group-hover:border-[#00ffcc] transition-colors">
                        <Check className="w-3 h-3 text-transparent group-hover:text-zinc-600" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-widest uppercase">SELECT ALL PENDING</span>
                    </label>
                    <button 
                      onClick={() => {
                        showLocalToast("BATCH LABEL GENERATION INITIATED.");
                        setStorefrontOrders(prev => prev.map(o => ({ ...o, status: 'SHIPPED / TRACKING LOGGED' })));
                      }}
                      className="bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/30 px-4 py-2 rounded text-[10px] font-mono font-black tracking-widest uppercase transition-colors shadow-[0_0_10px_rgba(0,255,204,0.1)] active:scale-95"
                    >
                      [ BATCH GENERATE LABELS & MARK AS SHIPPED ]
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {storefrontOrders.map((order, index) => (
                    <div key={order.id} className="bg-[#000000] border border-[#1A1A1A] p-4 rounded-xl shadow-lg relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 group-hover:bg-[#00ffcc] transition-colors" />
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#00ffcc]">ID: {order.id}</span>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase">{order.date}</span>
                        </div>
                        
                        <div>
                          <div className="text-[11px] font-mono tracking-widest text-zinc-300 mt-1 uppercase leading-relaxed font-bold">
                            {order.items}
                          </div>
                          <div className="text-[9.5px] font-mono tracking-wide text-zinc-500 mt-1">
                            SHIP TO: {order.buyer}
                          </div>
                        </div>
                        
                        {/* TRACKING INPUT & ACTION BUTTON */}
                        <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row gap-3">
                          <div className="flex-1 flex flex-col justify-end">
                            <label className="text-[8px] font-mono font-bold uppercase text-zinc-500 block mb-1">TRACKING NUMBER ID: [ INPUT ]</label>
                            <input 
                              type="text"
                              placeholder="ENTER TRACKING ID..."
                              className="w-full bg-[#0D0D0D] border border-zinc-800 rounded px-3 py-2 text-[10px] font-mono text-[#00ffcc] tracking-widest uppercase focus:outline-none focus:border-[#FF9900] transition-colors"
                            />
                          </div>
                          <div className="sm:w-1/3 flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                setStorefrontOrders(prev => prev.map((o, i) => i === index ? { ...o, status: o.status === 'UNFULFILLED' ? 'SHIPPED / TRACKING LOGGED' : 'UNFULFILLED' } : o))
                              }}
                              className={\`w-full h-[34px] rounded text-[9px] font-mono font-black tracking-widest uppercase transition-all \${
                                order.status === 'UNFULFILLED' 
                                  ? 'bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30 hover:bg-[#FF9900]/20' 
                                  : 'bg-emerald-500/10 text-[#00ffcc] border border-emerald-500/30 hover:bg-emerald-500/20'
                              }\`}
                            >
                              {order.status}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LAYER 02: PUBLIC STOREFRONT THEME & LAYOUT CONFIGURATOR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                ${configuratorBlock}
                ${controlConsoleBlock}
              </div>

              {/* LAYER 03: CENTRAL CATALOG LIVE-SYNC */}
              <div className="space-y-4 mt-8 bg-[#000000] border border-[#1A1A1A] rounded-xl p-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <h3 className="text-xs font-black font-mono text-[#FF9900] tracking-widest uppercase flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    CENTRAL CATALOG LIVE-SYNC
                  </h3>
                  <span className="text-[9px] font-mono bg-[#1A1A1A] text-[#00ffcc] px-2 py-0.5 rounded uppercase font-bold tracking-widest">Inventory Switchboard</span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {([...(Object.values(catalogReleases).flat() as any[]), ...(Object.values(catalogApparel).flat() as any[])]).map(item => {
                    const isSynced = storefrontSyncRecord[item.id] || false;
                    const bandName = labelRosterData.find(b => b.id === item.band_id)?.name || 'UNKNOWN BAND';
                    return (
                      <div key={item.id} className="bg-[#0D0D0D] border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-black border border-zinc-800 flex items-center justify-center shrink-0">
                            {item.type === 'Apparel' || item.type === 'Hoodie' || item.type === 'T-Shirt' ? <Layers className="w-5 h-5 text-zinc-600" /> : <Disc className="w-5 h-5 text-zinc-600" />}
                          </div>
                          <div>
                            <div className="text-[11px] font-sans font-black text-white tracking-widest uppercase">{item.title}</div>
                            <div className="text-[9px] font-mono text-[#00ffcc] uppercase tracking-widest mt-0.5">{bandName} • {item.type} • \${(item.price ?? 0).toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={\`text-[8px] font-mono uppercase font-bold \${isSynced ? 'text-[#00ffcc]' : 'text-zinc-500'}\`}>
                            {isSynced ? 'LIVE ON STOREFRONT' : 'HIDDEN'}
                          </span>
                          <label className="relative cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              checked={isSynced}
                              onChange={(e) => setStorefrontSyncRecord(prev => ({ ...prev, [item.id]: e.target.checked }))}
                            />
                            <div className={\`w-10 h-5 rounded-full transition-colors relative \${isSynced ? 'bg-[#FF9900]' : 'bg-[#1A1A1A] border border-zinc-700'}\`}>
                              <div className={\`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform \${isSynced ? 'translate-x-5' : 'translate-x-0.5'}\`} />
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
`;

const updatedContent = content.substring(0, startIndex) + newStructure + "\n" + content.substring(endIndex);
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('Successfully updated the storefront layout');
