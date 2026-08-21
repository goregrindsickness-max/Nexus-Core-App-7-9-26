import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { uploadFeedMedia } from '../../lib/storage';
import { Send, Image, Tag, Loader2, Sparkles, Music, Paperclip, X, Volume2 } from 'lucide-react';

export const handleCreatePost = async (content: string, mediaUrl?: string) => {
  const trimmedContent = content.trim();
  if (!trimmedContent && !mediaUrl) return null;

  console.log('[CREATE POST TRIGGERED] Direct RPC Execution initiated...');

  try {
    // 1. Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      alert('You must be logged in to create a post.');
      return null;
    }

    const userId = session.user.id;
    console.log('[RPC Publish] Author User ID:', userId);

    // Ensure user profile row exists in `profiles` to satisfy foreign key constraint
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!existingProfile?.id) {
      console.log('[RPC Publish] Creating profile stub for auth user:', userId);
      await supabase.from('profiles').upsert([{
        id: userId,
        full_name: session.user.user_metadata?.full_name || session.user.email || 'Nexus Member',
        email: session.user.email || '',
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });
    }

    // 2. Execute RPC function directly (bypasses PostgREST table RLS completely)
    const { data, error } = await supabase.rpc('publish_post_direct', {
      p_content: trimmedContent || ' ',
      p_media_url: mediaUrl || null,
      p_profile_id: userId
    });

    if (error) {
      console.error('[RPC Publish Failed]:', error.message, error.details);
      alert(`Error publishing post: ${error.message}`);
      return null;
    }

    console.log('[RPC Publish Succeeded!]:', data);

    // 3. Dispatch global sync event for timeline auto-refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('nexus_post_created'));
    }

    return data;

  } catch (err) {
    console.error('[Unexpected RPC Error]:', err);
    return null;
  }
};

const isAudioUrl = (url?: string): boolean => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return cleanUrl.endsWith('.mp3') || cleanUrl.endsWith('.wav') || cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.m4a') || cleanUrl.includes('audio');
};

interface CreatePostProps {
  onPostCreated?: () => void;
  placeholder?: string;
  defaultTag?: string;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  onPostCreated,
  placeholder = "Broadcast signal to the underground nexus...",
  defaultTag = "ANNOUNCEMENT"
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState(defaultTag);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'image' | 'audio' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAudio = file.type.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.ogg'].some(ext => file.name.toLowerCase().endsWith(ext));
    setSelectedFileType(isAudio ? 'audio' : 'image');
    setSelectedFileName(file.name);
    setIsUploading(true);

    try {
      const publicUrl = await uploadFeedMedia(file);
      if (publicUrl) {
        setMediaUrl(publicUrl);
      } else {
        setSelectedFileName(null);
        setSelectedFileType(null);
      }
    } catch (err) {
      console.error('[CreatePost Upload Error]:', err);
      alert('Failed to upload media file.');
      setSelectedFileName(null);
      setSelectedFileType(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl('');
    setSelectedFileName(null);
    setSelectedFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isUploading) return;
    if (!content.trim() && !mediaUrl) return;

    setIsSubmitting(true);
    try {
      const result = await handleCreatePost(content, mediaUrl);
      if (result || result === undefined) {
        setContent('');
        setMediaUrl('');
        setSelectedFileName(null);
        setSelectedFileType(null);
        setShowMediaInput(false);
        if (onPostCreated) onPostCreated();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAudioAttached = isAudioUrl(mediaUrl) || selectedFileType === 'audio';

  return (
    <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-3 sm:p-4 shadow-xl backdrop-blur-md mb-4 text-left">
      {/* Hidden file input supporting image and audio */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
              CREATE TRANSMISSION
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {['ANNOUNCEMENT', 'LIVE RITUAL', 'MERCH DROP', 'SLAM'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTag(t)}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border transition-all ${
                  selectedTag === t
                    ? 'bg-rose-950/60 text-rose-400 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                    : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 resize-none font-sans"
          />
        </div>

        {/* Media Preview or Input URL */}
        {mediaUrl ? (
          <div className="relative bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-3">
            {hasAudioAttached ? (
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-bold text-zinc-200 truncate">
                    {selectedFileName || 'Audio Track Attached'}
                  </p>
                  <audio controls className="w-full h-8 mt-1 rounded accent-rose-500">
                    <source src={mediaUrl} />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full overflow-hidden">
                <img src={mediaUrl} alt="Attached Media" className="w-12 h-12 object-cover rounded-lg border border-zinc-800 shrink-0" />
                <p className="text-xs font-mono text-zinc-300 truncate flex-1">
                  {selectedFileName || 'Image attached'}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : showMediaInput ? (
          <div className="flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 p-2 rounded-lg">
            <Image className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Paste Image, Audio (.mp3, .wav), or GIF URL..."
              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                isUploading
                  ? 'bg-rose-950/40 text-rose-400 border-rose-500/40'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                  <span>UPLOADING MEDIA...</span>
                </>
              ) : (
                <>
                  <Paperclip className="w-3.5 h-3.5 text-rose-400" />
                  <span>UPLOAD FILE (MAX 50MB)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className={`flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                showMediaInput || mediaUrl
                  ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              {mediaUrl ? 'MEDIA LINKED' : 'PASTE URL'}
            </button>
          </div>

          <button
            type="submit"
            disabled={(!content.trim() && !mediaUrl) || isSubmitting || isUploading}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 text-white font-mono font-bold text-xs px-4 py-1.5 rounded-lg transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>DISPATCHING...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>POST TRANSMISSION</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
