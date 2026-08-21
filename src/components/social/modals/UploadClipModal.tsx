import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlaySquare, X, Upload, Video, RefreshCw, Music2 } from 'lucide-react';

interface UploadClipModalProps {
  showUploadClipModal: boolean;
  setShowUploadClipModal: (val: boolean) => void;
  newClipVideoUrl: string;
  setNewClipVideoUrl: (val: string) => void;
  selectedClipFile: File | null;
  setSelectedClipFile: (file: File | null) => void;
  newClipCaption: string;
  setNewClipCaption: (val: string) => void;
  newClipTitle?: string;
  setNewClipTitle?: (val: string) => void;
  newClipSongTitle: string;
  setNewClipSongTitle: (val: string) => void;
  newClipBandName: string;
  setNewClipBandName: (val: string) => void;
  newClipTags: string;
  setNewClipTags: (val: string) => void;
  setClips: React.Dispatch<React.SetStateAction<any[]>>;
  userProfile?: any;
  triggerNotification?: (msg: string) => void;
  getSupabase?: () => any;
}

export const UploadClipModal: React.FC<UploadClipModalProps> = ({
  showUploadClipModal,
  setShowUploadClipModal,
  newClipVideoUrl,
  setNewClipVideoUrl,
  selectedClipFile,
  setSelectedClipFile,
  newClipCaption,
  setNewClipCaption,
  newClipTitle = '',
  setNewClipTitle,
  newClipSongTitle,
  setNewClipSongTitle,
  newClipBandName,
  setNewClipBandName,
  newClipTags,
  setNewClipTags,
  setClips,
  userProfile,
  triggerNotification,
  getSupabase
}) => {
  const [isUploadingClip, setIsUploadingClip] = useState(false);
  const [isCompressingClip, setIsCompressingClip] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  const handlePostClip = async () => {
    if (!newClipVideoUrl && !selectedClipFile) {
      triggerNotification?.("Please provide a video URL or select a clip file.");
      return;
    }

    setIsUploadingClip(true);
    try {
      let finalVideoUrl = newClipVideoUrl;

      const supabaseClient = getSupabase ? getSupabase() : null;

      if (selectedClipFile && supabaseClient) {
        const fileExt = selectedClipFile.name.split('.').pop();
        const fileName = `${userProfile?.id || 'anon'}_${Date.now()}.${fileExt}`;
        const filePath = `clips/${fileName}`;

        const { data, error } = await supabaseClient.storage.from('media').upload(filePath, selectedClipFile);
        if (error) {
          console.warn("Storage upload failed, falling back to local object URL:", error);
          finalVideoUrl = URL.createObjectURL(selectedClipFile);
        } else if (data) {
          const { data: publicData } = supabaseClient.storage.from('media').getPublicUrl(filePath);
          finalVideoUrl = publicData.publicUrl;
        }
      }

      if (!finalVideoUrl) {
        finalVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-rock-band-performing-on-stage-41584-large.mp4';
      }

      const newClipObj = {
        id: `clip_${Date.now()}`,
        user_id: userProfile?.id,
        username: userProfile?.username || userProfile?.full_name || 'Anonymous',
        author: userProfile?.username || userProfile?.full_name || 'Anonymous',
        avatar: userProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        video_url: finalVideoUrl,
        videoUrl: finalVideoUrl,
        caption: newClipCaption,
        title: newClipTitle || newClipCaption || 'Live Clip',
        songTitle: newClipSongTitle || 'Pit Anthem',
        bandName: newClipBandName || userProfile?.full_name || 'Scene Band',
        tags: newClipTags ? newClipTags.split(',').map(t => t.trim()) : ['SLAM', 'LIVE'],
        likes: 1,
        commentsCount: 0,
        shares: 0,
        viewsCount: 1,
        created_at: new Date().toISOString()
      };

      if (supabaseClient && userProfile?.id) {
        await supabaseClient.from('nexus_clips').insert({
          profile_id: userProfile.id,
          username: newClipObj.username,
          avatar: newClipObj.avatar,
          video_url: newClipObj.video_url,
          caption: newClipObj.caption,
          song_title: newClipObj.songTitle,
          band_name: newClipObj.bandName,
          created_at: newClipObj.created_at
        });
      }

      setClips((prev) => [newClipObj, ...prev]);

      setNewClipCaption('');
      if (setNewClipTitle) setNewClipTitle('');
      setNewClipVideoUrl('');
      setSelectedClipFile(null);
      setShowUploadClipModal(false);
      triggerNotification?.("Clip published to Reels successfully!");
    } catch (err: any) {
      console.error("Failed to upload clip:", err);
      triggerNotification?.(`Error posting clip: ${err.message || err}`);
    } finally {
      setIsUploadingClip(false);
    }
  };

  return (
    <AnimatePresence>
      {showUploadClipModal && (
        <motion.div key="modal-backdrop-uploadclipmodal-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-start md:items-center overflow-y-auto p-4 py-8 ">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-[#121214] border border-rose-900/40 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.15)] flex flex-col max-h-[85vh] my-auto"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950/40 shrink-0">
            <span className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5 font-display">
              <PlaySquare className="w-4 h-4 text-rose-400" /> New Reel Clip
            </span>
            <button
              onClick={() => setShowUploadClipModal(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900/50 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex flex-col space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            <div className="w-full flex flex-col gap-4">
              {newClipVideoUrl ? (
                <div
                  className="w-full relative rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-700"
                  style={{ height: '240px' }}
                >
                  <video src={newClipVideoUrl} className="w-full h-full object-contain" controls autoPlay loop playsInline />
                  <button
                    onClick={() => {
                      setNewClipVideoUrl('');
                      setSelectedClipFile(null);
                    }}
                    className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-rose-500/80 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-rose-500/50 transition-colors bg-zinc-950/40">
                    <Video className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                    <label className="text-xs font-bold text-zinc-300 block cursor-pointer">
                      Select Video File
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedClipFile(file);
                            setNewClipVideoUrl(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">MP4, MOV, or WEBM up to 100MB</p>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Or paste video URL..."
                      value={newClipVideoUrl}
                      onChange={(e) => setNewClipVideoUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* Caption & Metadata Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                    CAPTION & PIT NOTES
                  </label>
                  <textarea
                    placeholder="Add a caption..."
                    value={newClipCaption}
                    onChange={(e) => setNewClipCaption(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                      SONG TITLE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Slit Your Gut"
                      value={newClipSongTitle}
                      onChange={(e) => setNewClipSongTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                      BAND NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CRYPTOPSY"
                      value={newClipBandName}
                      onChange={(e) => setNewClipBandName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">
                    GENRE TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="SLAM, TECHNICAL DEATH, LIVE"
                    value={newClipTags}
                    onChange={(e) => setNewClipTags(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePostClip}
                disabled={isUploadingClip || isCompressingClip}
                className={`w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-colors mt-4 shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 cursor-pointer ${
                  isUploadingClip || isCompressingClip ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isCompressingClip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Optimizing Quality ({compressionProgress}%)</span>
                  </>
                ) : isUploadingClip ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Posting Clip...</span>
                  </>
                ) : (
                  <span>Post Reel Clip</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
