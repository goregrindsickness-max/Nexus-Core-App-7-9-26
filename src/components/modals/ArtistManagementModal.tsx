import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Edit2, Upload, Check, ShieldCheck, ShieldAlert, Trash2, Plus } from 'lucide-react';
import { Band } from '../../types';

interface ArtistManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBand: Band | null;
  setEditingBand: (band: Band | null) => void;
  editName: string;
  setEditName: (val: string) => void;
  editGenre: string;
  setEditGenre: (val: string) => void;
  editLogoUrl: string;
  setEditLogoUrl: (val: string) => void;
  editLogoPresetIdx: number;
  setEditLogoPresetIdx: (val: number) => void;
  handleUpdateBand: (e: React.FormEvent) => void;
  dragActive: boolean;
  setDragActive: (val: boolean) => void;
  handleLogoUpload: (file: File, isEdit: boolean) => void;
  editRosterFileInputRef: React.RefObject<HTMLInputElement | null>;
  rosterFileInputRef: React.RefObject<HTMLInputElement | null>;
  logoPresets: string[];
  bandLogoUrl: string;
  activeBand: Band | null;
  bands: Band[];
  activeBandId: string;
  setActiveBandId: (id: string) => void;
  addLog: (msg: string) => void;
  triggerNotification: (msg: string) => void;
  deletingBandId: string | null;
  setDeletingBandId: (id: string | null) => void;
  handleDeleteBand: (id: string, name: string) => void;
  newBandForm: { name: string; genre: string; logo_url: string };
  setNewBandForm: React.Dispatch<React.SetStateAction<{ name: string; genre: string; logo_url: string }>>;
  handleCreateBand: (e: React.FormEvent) => void;
  customLogoPreset: number;
  setCustomLogoPreset: (val: number) => void;
}

export const ArtistManagementModal: React.FC<ArtistManagementModalProps> = ({
  isOpen,
  onClose,
  editingBand,
  setEditingBand,
  editName,
  setEditName,
  editGenre,
  setEditGenre,
  editLogoUrl,
  setEditLogoUrl,
  editLogoPresetIdx,
  setEditLogoPresetIdx,
  handleUpdateBand,
  dragActive,
  setDragActive,
  handleLogoUpload,
  editRosterFileInputRef,
  rosterFileInputRef,
  logoPresets,
  bandLogoUrl,
  activeBand,
  bands,
  activeBandId,
  setActiveBandId,
  addLog,
  triggerNotification,
  deletingBandId,
  setDeletingBandId,
  handleDeleteBand,
  newBandForm,
  setNewBandForm,
  handleCreateBand,
  customLogoPreset,
  setCustomLogoPreset
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="band-modal-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.94, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 1 }}
            className="bg-[#0b0d13] border-2 border-[#1f2330] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]"
            id="band-selection-manager-modal"
          >
            <div className="px-5 py-4 border-b border-[#252830] flex justify-between items-center bg-[#07080a]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00ffcc]" /> 
                  ROSTER MANAGER
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Switch, edit, delete or register artists</p>
              </div>
              <button 
                onClick={() => {
                  onClose();
                  setEditingBand(null);
                }}
                className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {editingBand ? (
                /* EDITING DRILL DOWN MODE */
                <form onSubmit={handleUpdateBand} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <span className="text-[8.5px] font-mono text-[#00ffcc] uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Edit Profile Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingBand(null)}
                      className="text-[8px] font-mono text-zinc-400 hover:text-white uppercase bg-zinc-800/80 hover:bg-zinc-750 px-2 py-0.5 rounded transition-transform cursor-pointer"
                    >
                      Return to List
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Artist / Band Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#181b24] outline-none border border-zinc-800 focus:border-emerald-500 text-xs px-2.5 py-1.5 rounded text-white font-mono uppercase tracking-wider"
                        required
                        placeholder="e.g. Spectral Decay"
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Genre</label>
                      <input 
                        type="text" 
                        value={editGenre}
                        onChange={(e) => setEditGenre(e.target.value)}
                        className="w-full bg-[#181b24] outline-none border border-zinc-800 focus:border-emerald-500 text-xs px-2.5 py-1.5 rounded text-white font-mono uppercase tracking-wider"
                        placeholder="e.g. Sludge Metal"
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-mono uppercase text-[#00ffcc] block mb-1">Logo Artwork (Upload or Choose)</label>
                      
                      {/* Interactive Drag & Drop box */}
                      <div 
                        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleLogoUpload(e.dataTransfer.files[0], true);
                          }
                        }}
                        onClick={() => editRosterFileInputRef.current?.click()}
                        className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          dragActive ? 'border-[#00ffcc] bg-[#142320]/60' : 'border-[#1b1f2b] hover:border-zinc-650 bg-[#12151d]'
                        }`}
                      >
                        <Upload className="w-5 h-5 text-zinc-500 hover:text-[#00ffcc] transition-colors" />
                        <span className="text-[9.5px] text-zinc-300 font-mono font-medium">Upload custom logo image file</span>
                        <span className="text-[7.5px] text-zinc-500 font-mono uppercase">Drag & Drop or Click (PNG/JPG under 2MB)</span>
                        <input 
                          type="file"
                          ref={editRosterFileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => e.target.files && e.target.files[0] && handleLogoUpload(e.target.files[0], true)}
                        />
                      </div>

                      {/* Presets Row */}
                      <div className="mt-3">
                        <span className="text-[7.5px] font-mono uppercase text-zinc-500 block mb-1.5">Or Choose Aesthetic Preset</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {logoPresets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setEditLogoUrl(preset);
                                setEditLogoPresetIdx(idx);
                              }}
                              className={`w-9 h-9 rounded-lg overflow-hidden border-2 relative shrink-0 transition-all ${
                                (editLogoPresetIdx === idx || editLogoUrl === preset) ? 'border-[#00ffcc] scale-105' : 'border-zinc-800 hover:border-zinc-600'
                              }`}
                            >
                              <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {(editLogoPresetIdx === idx || editLogoUrl === preset) && (
                                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-[#00ffcc]" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Upload Status / Preview */}
                      {editLogoUrl && (
                        <div className="mt-3 p-2 bg-[#0c0d12] border border-[#1d212d] rounded-lg flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500 bg-zinc-950 shrink-0">
                            <img src={editLogoUrl} alt="Logo Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[8px] font-mono text-emerald-400 block uppercase font-bold tracking-wide">Logo Selected</span>
                            <p className="text-[7px] text-zinc-500 truncate font-mono">{editLogoUrl}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                    <div className="flex gap-2 pt-2 border-t border-zinc-850">
                      <button
                        type="button"
                        onClick={() => setEditingBand(null)}
                        className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono font-bold uppercase text-[8.5px] tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-black font-mono font-bold uppercase text-[8.5px] tracking-wider rounded-lg shadow-lg transition-colors cursor-pointer"
                      >
                        Commit Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  /* PROFILE LISTING & REGISTRATION LIST MODE */
                  <>
                    {/* Active Artist Card */}
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-mono uppercase text-zinc-500 tracking-wider">Current Artist</span>
                      <div className="bg-[#13161d] border border-[#00ffcc]/35 p-3 rounded-lg flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00ffcc] bg-zinc-800">
                            <img src={bandLogoUrl || activeBand?.logo_url} alt={activeBand?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold font-display text-white uppercase tracking-wider flex items-center gap-1.5">
                              {activeBand?.name}
                              {activeBand?.is_verified ? (
                                <span title="Verified Artist"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /></span>
                              ) : (
                                <span title="Unverified / Fan Managed"><ShieldAlert className="w-3.5 h-3.5 text-amber-500" /></span>
                              )}
                            </h4>
                            <span className="text-[8.5px] font-mono text-[#00ffcc] tracking-wide uppercase">
                              {activeBand?.genre}
                              {!activeBand?.is_verified && " • FAN MANAGED"}
                            </span>
                          </div>
                        </div>
                        <span className="bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc] text-[8px] font-mono font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                          ACTIVE FOCUS
                        </span>
                      </div>
                    </div>

                    {/* Switch Artist Section */}
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-mono uppercase text-zinc-500 tracking-wider">Managed Roster Profiles</span>
                      <div className="grid grid-cols-1 gap-2 max-h-[190px] overflow-y-auto pr-1">
                        {bands.map((b) => (
                          <div
                            key={b.id}
                            className={`p-2 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
                              b.id === activeBandId 
                                ? 'bg-[#181d26] border-[#00ffcc] text-white' 
                                : 'bg-[#111319]/80 border-zinc-900 text-zinc-400'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveBandId(b.id);
                                onClose();
                                addLog(`Switched management client focuses to: ${b?.name}`);
                                triggerNotification(`Switched artist: ${b?.name}`);
                              }}
                              className="flex items-center gap-3 text-left flex-grow min-w-0 cursor-pointer text-white hover:text-[#00ffcc] group"
                            >
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                                <img src={b?.logo_url} alt={b?.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-center pr-1">
                                  <h5 className="text-[11px] font-bold font-display truncate uppercase text-white group-hover:text-[#00ffcc] flex items-center gap-1">
                                    {b?.name}
                                    {b?.is_verified ? (
                                      <span title="Verified Artist"><ShieldCheck className="w-3 h-3 text-emerald-500" /></span>
                                    ) : (
                                      <span title="Unverified / Fan Managed"><ShieldAlert className="w-3 h-3 text-amber-500" /></span>
                                    )}
                                  </h5>
                                  {b.id === activeBandId && (
                                    <Check className="w-3 h-3 text-[#00ffcc] shrink-0" />
                                  )}
                                </div>
                                <p className="text-[8px] font-mono text-zinc-500 truncate tracking-wide uppercase">{b?.genre}</p>
                              </div>
                            </button>
                            {/* Options block */}
                            <div className="flex items-center gap-1 shrink-0 bg-zinc-950/30 p-0.5 rounded border border-zinc-900">
                              {deletingBandId === b.id ? (
                                <div className="flex items-center gap-1 bg-[#1a0f12] p-1 rounded border border-rose-900/50">
                                  <span className="text-[7.5px] font-mono text-rose-500 uppercase">Sure?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBand(b.id, b?.name)}
                                    className="bg-rose-600 hover:bg-rose-500 text-white text-[8px] font-mono px-1.5 py-0.5 rounded uppercase"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingBandId(null)}
                                    className="bg-zinc-800 hover:bg-zinc-750 text-zinc-400 text-[8px] font-mono px-1 py-0.5 rounded uppercase"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingBand(b);
                                      setEditName(b?.name);
                                      setEditGenre(b?.genre);
                                      setEditLogoUrl(b?.logo_url);
                                      setEditLogoPresetIdx(logoPresets.indexOf(b?.logo_url));
                                    }}
                                    className="p-1 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
                                    title="Edit artist specifications"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingBandId(b.id)}
                                    className="p-1 rounded bg-rose-950/20 hover:bg-rose-950/75 text-rose-450 hover:text-rose-400 transition-all cursor-pointer"
                                    title="Delete artist profile"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add New Artist Form Section */}
                    <div className="border-t border-zinc-850 pt-4">
                      <form onSubmit={handleCreateBand} className="space-y-3">
                        <span className="text-[8.5px] font-mono uppercase text-[#00ffcc] tracking-wider font-extrabold block">
                          + Register Brand New Artist / Band
                        </span>
                        <div className="space-y-1.5">
                          <div>
                            <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Band Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Spectral Decay" 
                              value={newBandForm.name}
                              onChange={(e) => setNewBandForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full bg-[#181b24] outline-none border border-zinc-800 focus:border-emerald-500 text-xs px-2.5 py-1.5 rounded text-white font-mono uppercase tracking-wider"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Genre</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Sludge Metal" 
                              value={newBandForm.genre}
                              onChange={(e) => setNewBandForm(p => ({ ...p, genre: e.target.value }))}
                              className="w-full bg-[#181b24] outline-none border border-zinc-800 focus:border-emerald-500 text-xs px-2.5 py-1.5 rounded text-white font-mono uppercase tracking-wider"
                            />
                          </div>

                          <div>
                            <label className="text-[8px] font-mono uppercase text-zinc-500 block mb-1">Upload Profile Logo / Artwork</label>
                            <div 
                              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleLogoUpload(e.dataTransfer.files[0], false);
                                }
                              }}
                              onClick={() => rosterFileInputRef.current?.click()}
                              className={`cursor-pointer border-2 border-dashed rounded-xl p-3 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                dragActive ? 'border-[#00ffcc] bg-[#142320]/60' : 'border-[#1b1f2b] hover:border-zinc-700 bg-[#12151d]'
                              }`}
                            >
                              <Upload className="w-4 h-4 text-zinc-500" />
                              <span className="text-[8.5px] text-zinc-300 font-mono">Upload custom logo image</span>
                              <span className="text-[7.5px] text-zinc-500 font-mono uppercase">Drag & Drop or Click (PNG/JPG under 2MB)</span>
                              <input 
                                type="file"
                                ref={rosterFileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files && e.target.files[0] && handleLogoUpload(e.target.files[0], false)}
                              />
                            </div>

                            {/* Preset Selectors row */}
                            <div className="mt-2.5">
                              <span className="text-[7.5px] font-mono uppercase text-zinc-500 block mb-1">Or choose a core preset style</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {logoPresets.map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setCustomLogoPreset(idx);
                                      setNewBandForm(p => ({ ...p, logo_url: '' })); // clear custom
                                    }}
                                    className={`w-8.5 h-8.5 rounded-lg overflow-hidden border-2 relative shrink-0 transition-all ${
                                      (customLogoPreset === idx && !newBandForm.logo_url) ? 'border-[#00ffcc] scale-105' : 'border-zinc-800 hover:border-zinc-650'
                                    }`}
                                  >
                                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    {(customLogoPreset === idx && !newBandForm.logo_url) && (
                                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-[#00ffcc]" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Uploaded banner preview */}
                            {newBandForm.logo_url && !logoPresets.includes(newBandForm.logo_url) && (
                              <div className="mt-3 p-2 bg-[#0c0d12] border border-[#1d212d] rounded-lg flex items-center gap-2.5">
                                <div className="w-8.5 h-8.5 rounded-full overflow-hidden border border-emerald-500 bg-zinc-950 shrink-0">
                                  <img src={newBandForm.logo_url} alt="Custom Logo Upload Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="min-w-0 flex-grow">
                                  <span className="text-[8px] font-mono text-emerald-400 block uppercase font-bold tracking-wide">Custom File Loaded</span>
                                  <p className="text-[7px] text-zinc-500 truncate font-mono">Ready to commit</p>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setNewBandForm(p => ({ ...p, logo_url: '' }))}
                                  className="text-[8px] font-mono text-zinc-500 hover:text-rose-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase text-[10px] tracking-widest rounded-lg flex items-center justify-center gap-1 shadow-lg transition-colors cursor-pointer mt-4"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to Manager Roster
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
};

export default ArtistManagementModal;
