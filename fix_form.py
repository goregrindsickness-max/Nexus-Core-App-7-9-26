import re
with open("src/components/ReleasesCatalogTab.tsx", "r") as f:
    text = f.read()

replacement = '''<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 block uppercase font-black">RECORD LABEL (OPTIONAL)</label>
                          <input type="text" placeholder="Independent / Label Name" value={newReleaseLabel} onChange={e => setNewReleaseLabel(e.target.value)} className="w-full bg-black border border-zinc-850 text-white text-[11px] font-mono rounded-lg p-2.5 focus:outline-none focus:border-[#FF9900]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-zinc-500 block uppercase font-black">GENRE</label>
                          <input type="text" placeholder="e.g. Death Metal" value={newReleaseGenre} onChange={e => setNewReleaseGenre(e.target.value)} className="w-full bg-black border border-zinc-850 text-white text-[11px] font-mono rounded-lg p-2.5 focus:outline-none focus:border-[#FF9900]" />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 border-t border-zinc-900 pt-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-mono text-zinc-500 block uppercase font-black">ALBUM COVER UPLOAD</label>
                          {newReleaseCoverImage && (
                            <button
                               type="button"
                               onClick={() => setNewReleaseCoverImage(null)}
                              className="text-[8px] font-mono text-rose-400 hover:text-rose-350 uppercase"
                            >
                              [ Remove Cover ]
                            </button>
                          )}
                        </div>
                        <div 
                          className="border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 border-zinc-850 hover:border-zinc-700 bg-black/40"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if(file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        setNewReleaseCoverImage(ev.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            };
                            input.click();
                          }}
                        >
                           {newReleaseCoverImage ? (
                               <img src={newReleaseCoverImage} alt="Cover Preview" className="w-24 h-24 object-cover rounded-md border border-zinc-700" />
                           ) : (
                               <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CLICK TO UPLOAD COVER IMAGE</span>
                           )}
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-zinc-900 pt-3">
                          <div className="flex items-center justify-between">
                             <label className="text-[9px] font-mono text-zinc-500 block uppercase font-black">TRACKLIST</label>
                             <button type="button" onClick={() => setNewReleaseTracks([...newReleaseTracks, {id: Date.now().toString(), num: (newReleaseTracks.length + 1).toString(), title: '', duration: '', lyrics: ''}])} className="text-[9px] font-mono text-[#FF9900] bg-[#FF9900]/10 px-2 py-1 rounded border border-[#FF9900]/30 hover:bg-[#FF9900]/20">+ ADD TRACK</button>
                          </div>
                          {newReleaseTracks.map((track, idx) => (
                             <div key={track.id} className="bg-black/50 border border-zinc-850 rounded-lg p-2 space-y-2">
                                <div className="flex gap-2">
                                   <input type="text" placeholder="#" value={track.num} onChange={e => { const n = [...newReleaseTracks]; n[idx].num = e.target.value; setNewReleaseTracks(n); }} className="w-10 bg-black border border-zinc-850 text-white text-[11px] font-mono rounded-lg p-2 focus:outline-none focus:border-[#FF9900] text-center" />
                                   <input type="text" placeholder="Track Title" value={track.title} onChange={e => { const n = [...newReleaseTracks]; n[idx].title = e.target.value; setNewReleaseTracks(n); }} className="flex-1 bg-black border border-zinc-850 text-white text-[11px] font-mono rounded-lg p-2 focus:outline-none focus:border-[#FF9900]" />
                                   <input type="text" placeholder="Duration (e.g. 3:45)" value={track.duration} onChange={e => { const n = [...newReleaseTracks]; n[idx].duration = e.target.value; setNewReleaseTracks(n); }} className="w-24 bg-black border border-zinc-850 text-white text-[11px] font-mono rounded-lg p-2 focus:outline-none focus:border-[#FF9900] text-center" />
                                   <button type="button" onClick={() => { const n = [...newReleaseTracks]; n.splice(idx, 1); setNewReleaseTracks(n); }} className="p-2 text-rose-500 hover:text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/30"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div>
                                   <textarea placeholder="Lyrics (Optional)..." value={track.lyrics} onChange={e => { const n = [...newReleaseTracks]; n[idx].lyrics = e.target.value; setNewReleaseTracks(n); }} className="w-full bg-black border border-zinc-850 text-zinc-400 text-[10px] font-mono rounded-lg p-2 h-16 focus:outline-none focus:border-[#FF9900]" />
                                </div>
                             </div>
                          ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">'''

text = text.replace('<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">', replacement, 1)

with open("src/components/ReleasesCatalogTab.tsx", "w") as f:
    f.write(text)
print("Updated form layout.")
