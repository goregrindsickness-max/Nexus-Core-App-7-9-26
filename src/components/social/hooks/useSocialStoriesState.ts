import { useState, useEffect } from 'react';
import { getSupabase } from '../../../supabase';
import { mockStories } from '../../../data/socialFeedMockData';

const DEFAULT_MOCK_STORIES = mockStories.map((s: any) => ({
  ...s,
  user: s.name || s.user,
  mediaUrl: s.image || s.mediaUrl,
  caption: s.caption || `${s.name || s.user} live on stage`,
  timestamp: s.timestamp || '2h ago'
}));

function sanitizeStories(list: any[]) {
  if (!Array.isArray(list) || list.length === 0) return DEFAULT_MOCK_STORIES;
  return list.map((s: any, idx: number) => {
    const mockMatch = mockStories[idx % mockStories.length];
    const rawImage = s.image || s.mediaUrl || s.video;
    const imageIsFallback = !rawImage || rawImage.includes('1552374196') || (!rawImage.startsWith('http') && !rawImage.startsWith('data:'));
    const rawAvatar = s.avatar || s.user_avatar;
    const avatarIsFallback = !rawAvatar || rawAvatar.includes('1552374196') || (!rawAvatar.startsWith('http') && !rawAvatar.startsWith('data:'));
    
    const authorName = s.name || s.user || s.username || mockMatch?.name || 'Band Story';

    return {
      ...s,
      id: s.id || `story_${idx}`,
      name: authorName,
      user: authorName,
      username: authorName,
      avatar: avatarIsFallback ? (mockMatch?.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=150') : rawAvatar,
      image: imageIsFallback ? (mockMatch?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600') : rawImage,
      mediaUrl: imageIsFallback ? (mockMatch?.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600') : rawImage,
      border: s.border || mockMatch?.border || 'border-rose-500/80',
      textColor: s.textColor || s.textcolor || mockMatch?.textColor || 'text-rose-400',
      textOverlay: s.textOverlay || s.textoverlay || null,
      textStyle: s.textStyle || s.textstyle || 'metal',
      textColorHex: s.textColorHex || s.textcolorhex || '#ffffff',
      textSize: s.textSize ?? s.textsize ?? 16,
      textX: s.textX ?? s.textx ?? 50,
      textY: s.textY ?? s.texty ?? 50,
      stickerScale: s.stickerScale ?? s.stickerscale ?? 1.0,
      stickerX: s.stickerX ?? s.stickerx ?? 50,
      stickerY: s.stickerY ?? s.stickery ?? 30,
      stickers: s.stickers || []
    };
  });
}

export function useSocialStoriesState() {
  const [stories, setStories] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_pit_stories_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeStories(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load stories from localStorage:", e);
    }
    return DEFAULT_MOCK_STORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexus_pit_stories_v2', JSON.stringify(stories));
    } catch (e) {
      console.warn("Failed to save stories to localStorage:", e);
    }
  }, [stories]);

  // Load stories from Supabase database table on mount
  useEffect(() => {
    const fetchStories = async () => {
      const supabaseClient = getSupabase();
      if (!supabaseClient) return;
      try {
        const { data, error } = await supabaseClient
          .from('nexus_stories')
          .select('*')
          .order('id', { ascending: false });
          
        if (error) {
          console.warn("Supabase fetch stories returned error/warning (using local cached fallback):", error);
          return;
        }
        
        if (data && data.length > 0) {
          setStories(prev => {
            const dbIds = new Set(data.map(s => s.id));
            const localOnly = prev.filter(s => !dbIds.has(s.id) && s.id.startsWith('s_'));
            return sanitizeStories([...localOnly, ...data]);
          });
        }
      } catch (err) {
        console.error("Failed to fetch stories from Supabase:", err);
      }
    };
    fetchStories();
  }, []);

  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [showUploadStoryModal, setShowUploadStoryModal] = useState(false);
  const [newStoryImage, setNewStoryImage] = useState('');
  const [newStoryVideo, setNewStoryVideo] = useState('');
  const [selectedStoryFile, setSelectedStoryFile] = useState<File | null>(null);
  const [fallbackBase64, setFallbackBase64] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newStoryCaption, setNewStoryCaption] = useState('');
  const [newStoryMusic, setNewStoryMusic] = useState('');
  const [newStoryTextOverlay, setNewStoryTextOverlay] = useState('');
  const [newStoryTextStyle, setNewStoryTextStyle] = useState<'metal' | 'neon' | 'cyber' | 'minimal'>('metal');
  const [newStoryTextColor, setNewStoryTextColor] = useState('#ffffff');
  const [newStoryTextColorHex, setNewStoryTextColorHex] = useState('#ffffff');
  const [newStoryBorder, setNewStoryBorder] = useState('none');
  const [selectedStorySticker, setSelectedStorySticker] = useState('');
  const [newStoryStickers, setNewStoryStickers] = useState<string[]>([]);
  const [newStoryTextSize, setNewStoryTextSize] = useState(16);
  const [newStoryTextX, setNewStoryTextX] = useState(50);
  const [newStoryTextY, setNewStoryTextY] = useState(50);
  const [newStoryStickerScale, setNewStoryStickerScale] = useState(1.0);
  const [newStoryStickerX, setNewStoryStickerX] = useState(50);
  const [newStoryStickerY, setNewStoryStickerY] = useState(30);

  return {
    stories,
    setStories,
    storyProgress,
    setStoryProgress,
    isStoryPaused,
    setIsStoryPaused,
    showUploadStoryModal,
    setShowUploadStoryModal,
    newStoryImage,
    setNewStoryImage,
    newStoryVideo,
    setNewStoryVideo,
    selectedStoryFile,
    setSelectedStoryFile,
    fallbackBase64,
    setFallbackBase64,
    isUploading,
    setIsUploading,
    newStoryCaption,
    setNewStoryCaption,
    newStoryMusic,
    setNewStoryMusic,
    newStoryTextOverlay,
    setNewStoryTextOverlay,
    newStoryTextStyle,
    setNewStoryTextStyle,
    newStoryTextColor,
    setNewStoryTextColor,
    newStoryTextColorHex,
    setNewStoryTextColorHex,
    newStoryBorder,
    setNewStoryBorder,
    selectedStorySticker,
    setSelectedStorySticker,
    newStoryStickers,
    setNewStoryStickers,
    newStoryTextSize,
    setNewStoryTextSize,
    newStoryTextX,
    setNewStoryTextX,
    newStoryTextY,
    setNewStoryTextY,
    newStoryStickerScale,
    setNewStoryStickerScale,
    newStoryStickerX,
    setNewStoryStickerX,
    newStoryStickerY,
    setNewStoryStickerY
  };
}
