import fs from 'fs';

let content = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

const modalCode = `
      {/* EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#0e1015] border border-zinc-800 rounded-3xl p-6 w-full max-w-lg relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6 mt-4">
                <h3 className="text-xl font-bold text-white font-display tracking-wide uppercase">
                  {activeEditTab === 'band' ? 'Edit Artist Details' : 'Edit User Profile'}
                </h3>

                {activeEditTab === 'band' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Artist Name</label>
                      <input 
                        type="text" 
                        value={editBandForm.name || ''} 
                        onChange={e => setEditBandForm({...editBandForm, name: e.target.value})}
                        className="w-full bg-[#131b26] border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#a855f7]"
                        placeholder="Enter artist name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Genre</label>
                      <input 
                        type="text" 
                        value={editBandForm.genre || ''} 
                        onChange={e => setEditBandForm({...editBandForm, genre: e.target.value})}
                        className="w-full bg-[#131b26] border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#a855f7]"
                        placeholder="e.g. Alternative"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Homebase / Location</label>
                      <input 
                        type="text" 
                        value={editBandForm.homebase || ''} 
                        onChange={e => setEditBandForm({...editBandForm, homebase: e.target.value})}
                        className="w-full bg-[#131b26] border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#a855f7]"
                        placeholder="e.g. Los Angeles, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Bio / Description</label>
                      <textarea 
                        value={editBandForm.bio || ''} 
                        onChange={e => setEditBandForm({...editBandForm, bio: e.target.value})}
                        className="w-full bg-[#131b26] border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#a855f7] min-h-[100px]"
                        placeholder="Artist biography"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">User Name</label>
                      <input 
                        type="text" 
                        value={editUserForm.name || ''} 
                        onChange={e => setEditUserForm({...editUserForm, name: e.target.value})}
                        className="w-full bg-[#131b26] border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#00ffcc]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        value={editUserForm.email || ''} 
                        onChange={e => setEditUserForm({...editUserForm, email: e.target.value})}
                        className="w-full bg-[#131b26] border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#00ffcc]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Role</label>
                      <input 
                        type="text" 
                        value={editUserForm.role || ''} 
                        onChange={e => setEditUserForm({...editUserForm, role: e.target.value})}
                        className="w-full bg-[#131b26] border border-zinc-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#00ffcc]"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleSaveProfile();
                  }}
                  className="w-full mt-4 bg-[#00ffcc] text-black py-3 rounded-xl text-sm font-bold uppercase tracking-wider shadow-lg hover:brightness-110 transition"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

content = content.replace('{/* MOCK OAUTH MODAL OVERLAY */}', modalCode + '\n      {/* MOCK OAUTH MODAL OVERLAY */}');
fs.writeFileSync('src/components/SettingsView.tsx', content);
console.log("Appended Modal.");
