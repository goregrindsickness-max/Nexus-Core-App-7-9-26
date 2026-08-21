import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Activity, MessageSquare, Flame, Image as ImageIcon, Sparkles, Share2, Volume2, Video, Calendar, MapPin, Users, Lock, Check } from 'lucide-react';
import { YouTubeEmbedCard } from '../social/embeds/YouTubeEmbedCard';

export interface TimelinePost {
  id: string;
  profile_id?: string;
  author_id?: string;
  user_id?: string;
  content: string;
  media_url?: string | null;
  images?: string[];
  created_at: string;
  author?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  type?: string;
  tag?: string;
  reactions_count?: number;
  eventData?: any;
  merchData?: any;
  songData?: any;
  tapeData?: any;
}

interface TimelineTabProps {
  profileId?: string;
  userId?: string;
  profileName?: string;
  isYou?: boolean;
  selectedUserProfile?: any;
  workspaceType?: string;
  currentActiveWorkspace?: string;
  portalRole?: string;
  triggerPictureViewer?: (data: any) => void;
  triggerNotification?: (msg: string) => void;
}

const getValidUrl = (url: any): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === '[object Object]' ||
    trimmed === 'null/null'
  ) {
    return null;
  }
  return trimmed;
};

const isAudioUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];
  return (
    clean.endsWith('.mp3') ||
    clean.endsWith('.wav') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.flac') ||
    clean.endsWith('.m4a') ||
    clean.includes('/audio/') ||
    clean.startsWith('data:audio/')
  );
};

const isVideoUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.startsWith('data:video/')
  );
};

const isYoutubeUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const extractYoutubeId = (url?: string | null): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const TimelineTab: React.FC<TimelineTabProps> = ({
  profileId,
  userId,
  profileName = '',
  isYou = false,
  selectedUserProfile,
  workspaceType,
  currentActiveWorkspace,
  portalRole,
  triggerPictureViewer,
  triggerNotification
}) => {
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [rsvpedEvents, setRsvpedEvents] = useState<Record<string, boolean>>({});

  const fetchTimelinePosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const targetId = profileId || userId || selectedUserProfile?.id || '421610eb-3a87-4da6-b843-1adb4ab6aecb';
      const targetName = (profileName || selectedUserProfile?.name || '').toLowerCase();

      // Query posts for this profile
      let query = supabase
        .from('nexus_posts')
        .select('*')
        .eq('profile_id', targetId);

      let { data, error: selectErr } = await query.order('created_at', { ascending: false });

      // Fallback strategy: Select all posts and filter in memory by profile_id or JSONB data
      if (selectErr || !data || data.length === 0) {
        const fallbackAll = await supabase
          .from('nexus_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!fallbackAll.error && fallbackAll.data) {
          data = fallbackAll.data.filter((item: any) => {
            const postObj = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});

            if (item.profile_id === targetId || item.author_id === targetId || item.user_id === targetId) return true;
            if (postObj) {
              if (postObj.profile_id === targetId || postObj.postedBy === targetId || postObj.author?.id === targetId || postObj.author_id === targetId || postObj.userId === targetId) return true;
              if (targetName && (
                postObj.author?.name?.toLowerCase() === targetName ||
                postObj.authorName?.toLowerCase() === targetName ||
                postObj.author?.username?.toLowerCase() === targetName
              )) return true;
            }
            return false;
          });
          selectErr = null;
        }
      }

      if (selectErr) {
        console.warn('Post query notice:', selectErr.message);
        setError(selectErr.message);
      }

      const formattedPosts: TimelinePost[] = (data || []).filter((item: any) => {
        const postObj = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});
        // Exclude quiet vault posts from timeline view
        if (postObj.is_gallery_only === true || postObj.post_to_feed === false || postObj.hidden_from_feed === true || postObj.gallery_only === true) {
          return false;
        }
        return true;
      }).map((item: any) => {
        const postObj = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});

        const rawMediaUrl =
          getValidUrl(item.media_url) ||
          getValidUrl(postObj.media_url) ||
          getValidUrl(postObj.mediaUrl) ||
          getValidUrl(postObj.image) ||
          getValidUrl(postObj.image_url) ||
          getValidUrl(postObj.imageUrl) ||
          (Array.isArray(postObj.images) && postObj.images.length > 0 ? getValidUrl(postObj.images[0]) : null) ||
          getValidUrl(postObj.eventData?.flyerUrl) ||
          getValidUrl(postObj.merchData?.imageUrl) ||
          getValidUrl(postObj.songData?.coverUrl) ||
          getValidUrl(postObj.tapeData?.audioUrl) ||
          getValidUrl(postObj.youtubeUrl) ||
          getValidUrl(postObj.youtube_url) ||
          null;

        const imagesArray: string[] = Array.isArray(postObj.images) && postObj.images.length > 0
          ? postObj.images.map((img: any) => getValidUrl(img)).filter(Boolean) as string[]
          : (rawMediaUrl ? [rawMediaUrl] : []);

        return {
          id: item.id || postObj.id || `post_${Date.now()}_${Math.random()}`,
          profile_id: item.profile_id || item.author_id || item.user_id || postObj.profile_id || postObj.author_id || postObj.user_id,
          author_id: item.author_id || item.profile_id || item.user_id || postObj.author_id || postObj.profile_id || postObj.author_id,
          user_id: item.user_id || item.profile_id || item.author_id || postObj.user_id || postObj.profile_id || postObj.author_id,
          content: item.content || postObj.content || '',
          media_url: rawMediaUrl,
          images: imagesArray,
          created_at: item.created_at || postObj.timestamp || new Date().toISOString(),
          author: {
            name: postObj.author?.name || postObj.authorName || selectedUserProfile?.name || 'Nexus User',
            avatar: (postObj.author?.avatar && !postObj.author.avatar.includes('ui-avatars.com')) 
              ? postObj.author.avatar 
              : (postObj.authorAvatar && !postObj.authorAvatar.includes('ui-avatars.com'))
              ? postObj.authorAvatar
              : (selectedUserProfile?.avatar || selectedUserProfile?.avatar_url || selectedUserProfile?.profile_avatar || null),
            role: postObj.author?.role || postObj.authorRole || selectedUserProfile?.role || 'Band'
          },
          type: postObj.type || (postObj.eventData ? 'event' : postObj.merchData ? 'merch' : postObj.songData ? 'track' : 'post'),
          tag: postObj.tag || (postObj.eventData ? 'DIY EVENT' : postObj.merchData ? 'MERCH DROP' : postObj.songData ? 'AUDIO RELEASE' : 'TRANSMISSION'),
          reactions_count: postObj.reactions?.length || 0,
          eventData: postObj.eventData || item.event_data,
          merchData: postObj.merchData,
          songData: postObj.songData,
          tapeData: postObj.tapeData
        };
      });

      setPosts(formattedPosts);
    } catch (err: any) {
      console.error('Error loading timeline posts:', err);
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [profileId, userId, profileName, selectedUserProfile]);

  useEffect(() => {
    fetchTimelinePosts();

    // Sync via event listener for 'nexus_post_created'
    const handlePostCreated = () => {
      console.log('Detected nexus_post_created event. Refreshing timeline...');
      fetchTimelinePosts();
    };

    const handlePostDeleted = (e: any) => {
      const deletedId = e.detail?.id || e.detail;
      if (deletedId) {
        setPosts(prev => prev.filter(p => p.id !== deletedId && p.id !== `nexus_post_${deletedId}`));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('nexus_post_created', handlePostCreated);
      window.addEventListener('nexus_post_deleted', handlePostDeleted as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('nexus_post_created', handlePostCreated);
        window.removeEventListener('nexus_post_deleted', handlePostDeleted as EventListener);
      }
    };
  }, [fetchTimelinePosts]);

  const handleImageError = (postId: string) => {
    setFailedImages((prev) => ({ ...prev, [postId]: true }));
  };

  return (
    <div className="space-y-4 w-full text-left font-sans">
      {loading ? (
        <div className="py-12 text-center bg-zinc-950/40 border border-zinc-900 rounded-xl">
          <div className="inline-block animate-spin w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full mb-2" />
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
            SYNCHRONIZING TIMELINE TRANSMISSIONS...
          </p>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post, idx) => {
            const ytId = extractYoutubeId(post.media_url);
            const isAudio = isAudioUrl(post.media_url);
            const isVideo = isVideoUrl(post.media_url);
            const isYt = isYoutubeUrl(post.media_url) || !!ytId;
            const hasImage = post.media_url && !isAudio && !isVideo && !isYt && !failedImages[post.id];

            return (
              <div
                key={post.id ? `tl_post_${post.id}_${idx}` : `tl_idx_${idx}`}
                className="bg-zinc-950/80 border border-zinc-900 hover:border-zinc-800 transition-all rounded-xl p-4 shadow-lg text-left w-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-950 border border-rose-800/60 flex items-center justify-center text-[10px] font-black text-rose-300 uppercase overflow-hidden shrink-0">
                      {post.author?.avatar ? (
                        <img 
                          src={post.author?.avatar} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        (post.author?.name ? post.author.name.replace(/^@/, '').substring(0, 2) : 'NX').toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-zinc-200 leading-tight">
                        {post.author?.name || profileName || 'User'}
                      </p>
                      {/* Full Name in FULL CAPS */}
                      {(selectedUserProfile?.full_name || (post.author as any)?.full_name || (post.author as any)?.legal_name) && (
                        <p className={`text-[10px] font-mono font-bold tracking-wider mt-0.5 truncate uppercase ${
                          (portalRole === 'industry_pro' || selectedUserProfile?.account_type === 'industry pro' || selectedUserProfile?.account_type === 'industry_pro' || post.author?.role?.toLowerCase().includes('industry'))
                            ? 'text-purple-400'
                            : 'text-blue-400'
                        }`}>
                          {(selectedUserProfile?.full_name || (post.author as any)?.full_name || (post.author as any)?.legal_name).toUpperCase()}
                        </p>
                      )}
                      <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                        {new Date(post.created_at).toLocaleDateString()} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {(portalRole === 'industry_pro' || selectedUserProfile?.account_type === 'industry pro' || selectedUserProfile?.account_type === 'industry_pro' || post.author?.role?.toLowerCase().includes('industry')) ? (
                          <span className="text-[9px] font-mono font-bold tracking-wider text-purple-400 uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block shadow-[0_0_6px_rgba(168,85,247,0.6)]" />
                            Industry Pro
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                            Fan Supporter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-400 font-mono font-bold uppercase tracking-wider">
                      {post.tag || post.type}
                    </span>
                  </div>
                </div>

                {post.content && (
                  <p className="text-xs text-zinc-300 leading-relaxed my-2 whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}

                {/* Event Embed Card */}
                {post.eventData && (
                  <div className="bg-[#0e0c07] rounded-xl border border-amber-500/60 overflow-hidden my-3 shadow-[0_0_20px_rgba(245,158,11,0.15)] font-mono">
                    <div className="p-3 bg-gradient-to-r from-amber-950/80 via-zinc-950 to-amber-950/40 border-b border-amber-900/40 flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> {post.eventData.date} {post.eventData.time ? `• ${post.eventData.time}` : ''}
                      </span>
                      <span className="bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {post.eventData.cost || 'FREE'}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2">
                      <h4 className="text-sm font-extrabold text-white uppercase font-display">{post.eventData.title}</h4>
                      
                      <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{post.eventData.locationName}</span>
                        </div>
                        {post.eventData.isSecretLocation ? (
                          <p className="text-[10px] text-red-400 mt-0.5 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Secret Location — DM Host for details
                          </p>
                        ) : post.eventData.address ? (
                          <p className="text-[10px] text-zinc-400 mt-0.5">{post.eventData.address}</p>
                        ) : null}
                      </div>

                      {post.eventData.lineup && post.eventData.lineup.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {post.eventData.lineup.map((band: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-amber-200 text-[9px] rounded font-bold uppercase">
                              {band}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-amber-400" /> {post.eventData.rsvpsCount || 1} Attending
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRsvpedEvents(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                            triggerNotification?.("🔥 RSVP Confirmed! You're on the list for this show.");
                          }}
                          className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all ${
                            rsvpedEvents[post.id]
                              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                              : 'bg-amber-500 hover:bg-amber-400 text-black'
                          }`}
                        >
                          {rsvpedEvents[post.id] ? "RSVP'D (GOING)" : "RSVP / I'M GOING"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio File Player */}
                {isAudio && post.media_url && (
                  <div className="my-3 p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Audio Track / Transmission</span>
                    </div>
                    <audio controls src={post.media_url} className="w-full h-9 rounded-lg accent-rose-500" />
                  </div>
                )}

                {/* Video File Player */}
                {isVideo && post.media_url && (
                  <div className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-black">
                    <video controls src={post.media_url} className="w-full max-h-80 object-contain" />
                  </div>
                )}

                {/* YouTube Video Player */}
                {isYt && ytId && (
                  <YouTubeEmbedCard youtubeId={ytId} />
                )}

                {/* Image Display with Error Handling & Click to Enlarge */}
                {hasImage && post.media_url && (
                  <div
                    className="mt-3 max-h-80 min-h-[140px] bg-zinc-900/80 rounded-xl overflow-hidden border border-zinc-800/90 cursor-pointer relative group/postImg flex items-center justify-center"
                    onClick={() => {
                      if (triggerPictureViewer) {
                        triggerPictureViewer({
                          photoId: post.id,
                          username: post.author?.name,
                          imageUrl: post.media_url,
                          title: 'Timeline Photo',
                          caption: post.content
                        });
                      }
                    }}
                  >
                    <img
                      src={post.media_url}
                      onError={() => handleImageError(post.id)}
                      className="w-full h-full object-cover max-h-80 opacity-90 group-hover/postImg:opacity-100 group-hover/postImg:scale-105 transition-all duration-300"
                      alt="Post Media"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/postImg:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="text-[10px] font-mono text-white flex items-center gap-1.5 font-bold">
                        <ImageIcon className="w-3.5 h-3.5 text-rose-400" /> Click to enlarge
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-zinc-900/80 text-zinc-500 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => triggerNotification?.("⚡ Flame reaction logged.")}
                    className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Flame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerNotification?.("💬 Opening discussion thread...")}
                    className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerNotification?.("🔗 Signal link copied to clipboard!")}
                    className="flex items-center gap-1 hover:text-purple-400 transition-colors ml-auto"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-zinc-950/40 border border-zinc-900/60 rounded-xl w-full font-mono">
          <Sparkles className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">
            NO TIMELINE TRANSMISSIONS FOUND
          </p>
          <p className="text-[10px] text-zinc-600">
            {isYou || selectedUserProfile?.isYou
              ? "Use the broadcast box above to publish your first post to the network."
              : "This account has not posted any signals to the underground nexus yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimelineTab;