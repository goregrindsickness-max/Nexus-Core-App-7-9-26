import re
with open("src/components/PublicStorefrontView.tsx", "r") as f:
    text = f.read()

inline_return = '''  if (isInline) {
    const allItems = [
      ...(Object.values(catalogReleases).flat() as any[]).map(r => ({ ...r, type: 'Release' })),
      ...(Object.values(catalogApparel).flat() as any[]).map(a => ({ ...a, type: 'Apparel' }))
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2 pb-3 border-b border-zinc-900">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono">BOH: Public Storefront Inventory</h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase">Manage visibility and pricing for {labelName}'s public storefront</p>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] font-mono font-bold text-zinc-400">LIVE SYNC</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/50">
                <th className="p-3 text-[9px] font-black uppercase text-zinc-500 font-mono tracking-wider">Item</th>
                <th className="p-3 text-[9px] font-black uppercase text-zinc-500 font-mono tracking-wider">Type</th>
                <th className="p-3 text-[9px] font-black uppercase text-zinc-500 font-mono tracking-wider w-24">Price</th>
                <th className="p-3 text-[9px] font-black uppercase text-zinc-500 font-mono tracking-wider w-28 text-center">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {allItems.map(item => {
                const isVisible = storefrontSyncRecord[item.id] !== false;
                
                return (
                  <tr key={item.id} className="hover:bg-zinc-950/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                           <img src={item.image_url} alt="" className="w-8 h-8 object-cover rounded-md border border-zinc-800" />
                        ) : (
                           <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                             {item.type === 'Release' ? <Disc className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                           </div>
                        )}
                        <span className="text-xs font-bold text-white font-mono uppercase tracking-tight">{item.title || item.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center bg-black border border-zinc-800 rounded-lg px-2">
                        <span className="text-zinc-500 font-mono text-xs">$</span>
                        <input 
                          type="number"
                          value={item.price || 25}
                          onChange={(e) => {
                             const newPrice = Number(e.target.value);
                             if (item.type === 'Release' && setCatalogReleases) {
                                setCatalogReleases(prev => {
                                  const next = { ...prev };
                                  for (const bandId in next) {
                                    next[bandId] = next[bandId].map(r => r.id === item.id ? { ...r, price: newPrice } : r);
                                  }
                                  return next;
                                });
                             } else if (item.type === 'Apparel' && setCatalogApparel) {
                                setCatalogApparel(prev => {
                                  const next = { ...prev };
                                  for (const bandId in next) {
                                    next[bandId] = next[bandId].map(a => a.id === item.id ? { ...a, price: newPrice } : a);
                                  }
                                  return next;
                                });
                             }
                          }}
                          className="w-full bg-transparent text-xs font-mono text-white p-2 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (setStorefrontSyncRecord) {
                            setStorefrontSyncRecord(prev => ({ ...prev, [item.id]: !isVisible }));
                            triggerNotification(isVisible ? "Item hidden from public storefront." : "Item is now visible on storefront.");
                          }
                        }}
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-colors ${
                           isVisible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        {isVisible ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
'''

match = re.search(r'  return \(\s*<div className=\{isInline \? "w-full bg-\[\#050505\]', text)
if match:
    text = text[:match.start()] + inline_return + text[match.start():]
else:
    print("Could not find the return statement")

with open("src/components/PublicStorefrontView.tsx", "w") as f:
    f.write(text)
print("Updated PublicStorefrontView for inline BOH mode.")
