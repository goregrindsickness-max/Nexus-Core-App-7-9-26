import { useState, useEffect } from 'react';
import { getSupabase } from '../../../supabase';

export interface UseSocialClipsStateParams {
  triggerNotification?: (msg: string) => void;
}

export function useSocialClipsState({ triggerNotification }: UseSocialClipsStateParams) {
  const [clips, setClips] = useState<{
    id: any;
    creator: string;
    role: string;
    avatar: string;
    caption: string;
    title?: string;
    videoUrl: string;
    likes: number;
    comments: number;
    shares: number;
    reposts: number;
    views: number;
    audio: string;
    hasLiked: boolean;
    thumbnailUrl?: string;
    created_at?: string;
    user_id?: string;
  }[]>([]);

  const [showUploadClipModal, setShowUploadClipModal] = useState(false);
  const [newClipCaption, setNewClipCaption] = useState('');
  const [newClipVideoUrl, setNewClipVideoUrl] = useState('');
  const [selectedClipFile, setSelectedClipFile] = useState<File | null>(null);
  const [newClipTitle, setNewClipTitle] = useState('');
  const [isUploadingClip, setIsUploadingClip] = useState(false);
  const [selectedClipThumbnailFile, setSelectedClipThumbnailFile] = useState<File | null>(null);
  const [newClipThumbnailUrl, setNewClipThumbnailUrl] = useState('');
  const [clipDuration, setClipDuration] = useState<number>(15);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [isCompressingClip, setIsCompressingClip] = useState(false);
  const [shouldCompressClip, setShouldCompressClip] = useState(false);

  const [newClipSongTitle, setNewClipSongTitle] = useState('');
  const [newClipBandName, setNewClipBandName] = useState('');
  const [newClipTags, setNewClipTags] = useState('');

  const [showClipsAnalyticsModal, setShowClipsAnalyticsModal] = useState(false);
  const [showMyClipsModal, setShowMyClipsModal] = useState(false);
  const [activeClipComments, setActiveClipComments] = useState<number | null>(null);
  const [activeClipShare, setActiveClipShare] = useState<number | null>(null);
  const [activeClipMetrics, setActiveClipMetrics] = useState<number | null>(null);
  const [newClipCommentText, setNewClipCommentText] = useState('');

  const compressVideoFile = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      resolve(file);
    });
  };

  const deleteClip = async (clipId: string | number) => {
    setClips(prev => prev.filter(c => c.id !== clipId));
    triggerNotification?.("Clip deleted successfully!");
    const supabaseClient = getSupabase();
    if (supabaseClient && typeof clipId === 'string') {
      try {
        const { error } = await supabaseClient
          .from('clips')
          .delete()
          .eq('id', clipId);
        if (error) {
          console.error("Failed to delete clip from database:", error);
        }
      } catch (err) {
        console.error("Failed to delete clip:", err);
      }
    }
  };

  // Load clips from Supabase database table on mount
  useEffect(() => {
    const fetchClips = async () => {
      const supabaseClient = getSupabase();
      if (!supabaseClient) return;
      try {
        const { data: dbClips, error } = await supabaseClient
          .from('clips')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn("Supabase fetch clips returned error (using local cached fallback):", error);
          return;
        }

        if (dbClips && dbClips.length > 0) {
          const userIds = Array.from(new Set(dbClips.map((c: any) => c.user_id).filter(Boolean)));
          const profilesMap: { [key: string]: any } = {};

          if (userIds.length > 0) {
            const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
            const cleanUserIds = userIds.filter(isValidUUID);
            if (cleanUserIds.length > 0) {
              const { data: profiles } = await supabaseClient
                .from('profiles')
                .select('id, full_name, console_handle, avatar_url, account_type, creative_avatar, promoter_logo, role_badge')
                .in('id', cleanUserIds);

              if (profiles) {
                profiles.forEach((p: any) => {
                  profilesMap[p.id] = p;
                });
              }
            }
          }

          const mappedClips = dbClips.map((clip: any) => {
            const creatorProfile = profilesMap[clip.user_id];
            
            const creatorName = creatorProfile 
              ? (creatorProfile.name || creatorProfile.full_name || 'Anonymous Creator') 
              : 'Anonymous Creator';

            const creatorAvatar = creatorProfile 
              ? (creatorProfile.avatar_url || creatorProfile.label_avatar || creatorProfile.creative_avatar || creatorProfile.promoter_logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80') 
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80';

            const role = creatorProfile 
              ? (creatorProfile.role_badge || creatorProfile.account_type || 'Operator') 
              : 'Operator';

            return {
              id: clip.id,
              creator: creatorName,
              role: role,
              avatar: creatorAvatar,
              caption: clip.description || clip.title || '',
              title: clip.title || '',
              videoUrl: clip.video_url,
              thumbnailUrl: clip.thumbnail_url || '',
              likes: clip.likes_count || 0,
              comments: clip.comments_count || 0,
              shares: clip.shares_count || 0,
              reposts: 0,
              views: 100,
              audio: `Original Audio - ${creatorName}`,
              hasLiked: false,
              created_at: clip.created_at,
              user_id: clip.user_id
            };
          });

          setClips(prev => {
            const dbIds = new Set(mappedClips.map(c => c.id));
            const localOnly = prev.filter(c => !dbIds.has(c.id));
            return [...mappedClips, ...localOnly];
          });
        }
      } catch (err) {
        console.error("Failed to fetch clips from Supabase:", err);
      }
    };
    fetchClips();
  }, []);

  return {
    clips,
    setClips,
    showUploadClipModal,
    setShowUploadClipModal,
    newClipCaption,
    setNewClipCaption,
    newClipVideoUrl,
    setNewClipVideoUrl,
    selectedClipFile,
    setSelectedClipFile,
    newClipTitle,
    setNewClipTitle,
    isUploadingClip,
    setIsUploadingClip,
    selectedClipThumbnailFile,
    setSelectedClipThumbnailFile,
    newClipThumbnailUrl,
    setNewClipThumbnailUrl,
    clipDuration,
    setClipDuration,
    compressionProgress,
    setCompressionProgress,
    isCompressingClip,
    setIsCompressingClip,
    shouldCompressClip,
    setShouldCompressClip,
    newClipSongTitle,
    setNewClipSongTitle,
    newClipBandName,
    setNewClipBandName,
    newClipTags,
    setNewClipTags,
    showClipsAnalyticsModal,
    setShowClipsAnalyticsModal,
    showMyClipsModal,
    setShowMyClipsModal,
    activeClipComments,
    setActiveClipComments,
    activeClipShare,
    setActiveClipShare,
    activeClipMetrics,
    setActiveClipMetrics,
    newClipCommentText,
    setNewClipCommentText,
    compressVideoFile,
    deleteClip
  };
}
