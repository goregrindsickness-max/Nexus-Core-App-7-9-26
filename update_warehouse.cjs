const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

const startStr = `          {activeTab === 'warehouse' && (
            <div className="space-y-6 w-full animate-fade-in text-zinc-300">`;

const endStr = `          )}
        </section>

      </main>`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  console.error('Boundaries not found');
  process.exit(1);
}

const newContent = `          {activeTab === 'warehouse' && (
            <div className="space-y-6 w-full animate-fade-in text-zinc-300 pb-20">
              
              {/* TOP ACTION BUTTONS - LIKE INVENTORY PORTAL */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReleaseId(null);
                    setEditingApparelId(null);
                    setActiveTab('master-catalog');
                  }}
                  className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-[#00ffcc] py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,255,204,0.1)] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  ADD ITEM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const activeBand = labelRosterData[0] || null;
                    if (activeBand) {
                      setActiveRestockBand(activeBand);
                    }
                  }}
                  className="bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/50 text-[#FF9900] py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,153,0,0.1)] flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  VAN TRANSFER
                </button>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                     setWarehouseAuditLogs([
                      {
                        id: \`log_\${Date.now()}\`,
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        operator: 'HQ Automated',
                        type: 'RECONCILE',
                        message: 'Audit discrepancy log initiated.'
                      }, ...warehouseAuditLogs
                    ]);
                    showLocalToast('AUDIT LOG OPENED');
                  }}
                  className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 text-red-500 py-2.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  LOG INVENTORY DISCREPANCY (AUDIT)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('master-catalog');
                    showLocalToast('DIRECTED TO RE-ORDER CATALOG');
                  }}
                  className="w-full bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/50 text-emerald-500 py-2.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  NEED TO RE-STOCK? CLICK HERE!
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('storefront');
                  }}
                  className="w-full bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/50 text-purple-400 py-2.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  GO TO YOUR PUBLIC STOREFRONT
                </button>
              </div>

              {/* DROPDOWN TO SELECT BAND / LABEL MERCHANDISE */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl mt-6">
                <div className="flex items-center gap-2 text-[#FF9900]">
                  <Database className="w-4 h-4" />
                  <span className="font-mono text-xs font-black uppercase tracking-widest">Select Inventory View</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <select
                    value={warehouseBandFilter}
                    onChange={(e) => setWarehouseBandFilter(e.target.value)}
                    className="w-full sm:w-64 bg-black border border-zinc-800 text-[#00ffcc] font-mono text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#00ffcc] uppercase font-bold"
                  >
                    <option value="ALL_ROSTER">ALL LABEL MERCHANDISE & ROSTER</option>
                    {labelRosterData.map(b => (
                      <option key={b.id} value={b.id}>{b.name.toUpperCase()} CATALOG</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* INVENTORY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mt-6">
                {(() => {
                  const items = [];
                  Object.entries(catalogReleases).forEach(([bandId, releases]) => {
                    const band = labelRosterData.find(b => b.id === bandId) || { name: 'Unknown' };
                    releases.forEach(release => {
                      items.push({
                        id: release.id,
                        bandId,
                        bandName: band.name,
                        name: release.title,
                        image_url: 'https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=300',
                        item_type: 'MUSIC',
                        category: 'media',
                        status: 'Healthy',
                        price: release.price || 10.00,
                        table_stock: 0,
                        van_stock: (release.formats.vinyl?.warehouse_qty ?? 0) + 
                                  (release.formats.cd?.warehouse_qty ?? 0) + 
                                  (release.formats.cassette?.warehouse_qty ?? 0)
                      });
                    });
                  });
                  Object.entries(catalogApparel).forEach(([bandId, apparelList]) => {
                    const band = labelRosterData.find(b => b.id === bandId) || { name: 'Unknown' };
                    apparelList.forEach(apparel => {
                      items.push({
                        id: apparel.id,
                        bandId,
                        bandName: band.name,
                        name: apparel.title,
                        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=300',
                        item_type: 'APPAREL',
                        category: 'apparel',
                        status: 'Healthy',
                        price: apparel.price || 25.00,
                        table_stock: 0,
                        van_stock: apparel.warehouse_qty
                      });
                    });
                  });

                  const filteredItems = items.filter(item => {
                    return warehouseBandFilter === 'ALL_ROSTER' || item.bandId === warehouseBandFilter;
                  });

                  if (filteredItems.length === 0) {
                     return (
                       <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center space-y-2">
                         <span className="text-2xl">📦</span>
                         <p className="text-zinc-500 font-mono text-xs">No merchandise matches your current view filters.</p>
                       </div>
                     );
                  }

                  return filteredItems.map((item) => {
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          if (item.category === 'media') {
                            setEditingReleaseId(item.id);
                          } else {
                            setEditingApparelId(item.id);
                          }
                          setActiveTab('master-catalog');
                        }}
                        className="bg-[#0b0c0f] rounded-2xl relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between cursor-pointer border-[1.5px] border-zinc-800 hover:border-zinc-700"
                        style={{ boxShadow: '0 4px 20px -5px rgba(0,255,204,0.05)' }}
                      >
                        <div className="absolute top-0 inset-x-0 h-1 pointer-events-none bg-[#00ffcc]" />

                        <div className="w-full h-48 relative bg-zinc-900 overflow-hidden select-none">
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full ring-2 ring-black bg-[#00ffcc]" />
                          <span className="absolute bottom-2 left-2 text-md font-sans font-black text-[#00ffcc] tracking-tight bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                            $\{(item.price || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-white leading-tight font-sans tracking-tight min-h-[32px] line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-wider">{item.item_type}</p>
                          </div>

                          <div className="flex items-center justify-between mt-3 bg-zinc-950/40 p-2 rounded-lg border border-zinc-900/60">
                            <span className="text-[10px] text-zinc-500 font-mono text-left block">
                              Table Stock: <span className="text-white font-bold">{item.table_stock}</span> <br/>
                              Van Stock: <span className="text-zinc-300 font-bold">{item.van_stock}</span>
                            </span>
                          </div>

                          <div className="space-y-1.5 mt-2.5">
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
                              className="w-full py-1.5 px-2 bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-mono font-black uppercase rounded-lg transition-all text-center block cursor-pointer select-none"
                            >
                              SEND STOCK TO BAND
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
                              className="w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-900/80 hover:bg-[#39ff14]/10 border border-zinc-850 hover:border-[#39ff14]/30 text-[#39ff14] text-[8.5px] font-mono font-black uppercase rounded-lg transition-all text-center cursor-pointer select-none"
                            >
                              🚀 COPY TO MERCH SHOP
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

            </div>
          )}
        </section>

      </main>`;

const finalContent = content.substring(0, startIndex) + newContent + content.substring(endIndex);
fs.writeFileSync('src/components/LabelDashboardView.tsx', finalContent);
console.log('Update complete!');
