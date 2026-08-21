import { useState, useEffect, useRef } from 'react';
import { profileStore } from '../utils/indexedDB';
import { getSupabase, executeWithSchemaResilience, executeSanitizedProfileUpsert, sanitizeCreativePayload, formatCreativePayload, extractGlobalProfilePayload } from '../supabase';

export interface UseUserProfileStateProps {
  portalRole: string;
  userProfile?: any;
  activeBand?: any;
}

export function useUserProfileState({
  portalRole,
  userProfile,
  activeBand,
}: UseUserProfileStateProps) {
  const isLoadedRef = useRef(false);

  // User Profile PIN Protection States
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinEntered, setPinEntered] = useState('');
  const [pinError, setPinError] = useState('');

  // User Profile Custom States
  const [profileFullLegalName, setProfileFullLegalName] = useState(() => {
    const savedLegalName = typeof window !== 'undefined' ? (localStorage.getItem('nexus_full_legal_name') || localStorage.getItem('nexus_user_full_name')) : null;
    if (savedLegalName && savedLegalName.trim() !== '') return savedLegalName;
    if (portalRole === 'fan_only') {
      return userProfile?.full_name || userProfile?.legal_name || userProfile?.screen_name || userProfile?.name || 'Fan Listener';
    }
    if (portalRole === 'industry_pro') {
      return userProfile?.full_name || userProfile?.legal_name || userProfile?.name || 'Industry Pro';
    }
    if (portalRole === 'band') return activeBand?.name || userProfile?.bandName || 'Artist';
    if (portalRole === 'creative') return userProfile?.creative_metadata?.business_name || 'Pro Creative';
    if (portalRole === 'promoter') return userProfile?.promoter_metadata?.brand_name || 'Pro Promoter';
    if (portalRole === 'label') return userProfile?.label_company_name || 'Pro Label';

    if (userProfile?.full_name || userProfile?.legal_name) {
      return userProfile.full_name || userProfile.legal_name || '';
    }
    if (userProfile?.name && userProfile.name !== 'New User' && userProfile.name !== '') {
      return userProfile.name;
    }
    return 'Fan Listener';
  });

  const [profileHandle, setProfileHandle] = useState(() => {
    if (userProfile?.console_handle && userProfile.console_handle !== '') {
      return userProfile.console_handle;
    }
    if (portalRole === 'fan_only') {
      return userProfile?.screen_name?.toLowerCase().replace(/\s+/g, '') || 'fan_core';
    }
    if (portalRole === 'band') return (activeBand?.name || userProfile?.bandName || 'band_core').toLowerCase().replace(/\s+/g, '');
    if (portalRole === 'creative') return userProfile?.creative_metadata?.business_name?.toLowerCase().replace(/\s+/g, '') || 'creative_pro';
    if (portalRole === 'promoter') return userProfile?.promoter_metadata?.brand_name?.toLowerCase().replace(/\s+/g, '') || 'promoter_pro';
    if (portalRole === 'label') return userProfile?.label_url_slug || 'label_pro';

    if (userProfile?.screen_name && userProfile.screen_name !== '') {
      return userProfile.screen_name.toLowerCase().replace(/\s+/g, '');
    }
    if (userProfile?.name && userProfile.name !== 'New User' && userProfile.name !== '') {
      return userProfile.name.toLowerCase().replace(/\s+/g, '');
    }
    return 'pro_user';
  });

  const [profileEmail, setProfileEmail] = useState(userProfile?.email || '');
  const [profilePassword, setProfilePassword] = useState('hardcore123');
  const [profilePin, setProfilePin] = useState(userProfile?.pin || '123456');
  const [profileLocation, setProfileLocation] = useState(() => {
    const signupLocation = (userProfile?.city && userProfile?.state_province) ? `${userProfile.city}, ${userProfile.state_province}` : null;
    if (portalRole === 'fan_only') return signupLocation || userProfile?.city_state || userProfile?.location_code || 'Denison, TX';
    if (portalRole === 'label' && userProfile?.label_headquarters) {
      return userProfile.label_headquarters;
    }
    return signupLocation || userProfile?.city_state || userProfile?.location_code || 'Detroit, MI';
  });

  const [profileZip, setProfileZip] = useState(userProfile?.zip_code || '');
  const [profileGenres, setProfileGenres] = useState<string[]>(() => {
    if (portalRole === 'fan_only') return ['Goregrind', 'Slam', 'Brutal Death Metal', 'Death Metal'];
    return ['Death Metal', 'Technical Death Metal', 'Grindcore'];
  });

  const [expandedClusters, setExpandedClusters] = useState<Record<string, boolean>>({});
  const [genreClusterExpanded, setGenreClusterExpanded] = useState(false);
  const [profilePrimaryGenres, setProfilePrimaryGenres] = useState<string[]>(['Goregrind', 'Slamming BDM']);
  const [profileMicroGenres, setProfileMicroGenres] = useState<string[]>(['Groovy Goregrind', 'Cybergrind']);

  const parseSongParts = (raw: string) => {
    if (!raw || raw === 'None Selected') return { artist: '', title: '' };
    if (raw.includes(' - ')) {
      const parts = raw.split(' - ');
      return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
    }
    return { artist: '', title: raw.trim() };
  };

  const initialSongParts = parseSongParts(userProfile?.top_song_title || userProfile?.favoriteSong || '');
  const [profileTopSongArtist, setProfileTopSongArtist] = useState<string>(initialSongParts.artist);
  const [profileTopSongTitle, setProfileTopSongTitle] = useState<string>(initialSongParts.title);

  const [profileFavoriteSong, setProfileFavoriteSong] = useState<string>(() => {
    return userProfile?.top_song_title || userProfile?.favoriteSong || '';
  });
  const [profileTopSongUrl, setProfileTopSongUrl] = useState<string>(() => {
    return userProfile?.top_song_url || '';
  });

  useEffect(() => {
    if (userProfile?.top_song_url && userProfile.top_song_url !== profileTopSongUrl) {
      setProfileTopSongUrl(userProfile.top_song_url);
    }
    const titleVal = userProfile?.top_song_title || userProfile?.favoriteSong;
    if (titleVal && titleVal !== profileFavoriteSong) {
      setProfileFavoriteSong(titleVal);
      const parts = parseSongParts(titleVal);
      if (parts.artist) setProfileTopSongArtist(parts.artist);
      if (parts.title) setProfileTopSongTitle(parts.title);
    }
  }, [userProfile?.top_song_url, userProfile?.top_song_title, userProfile?.favoriteSong]);
  const [profileMetalArchivesUrl, setProfileMetalArchivesUrl] = useState<string>(() => {
    return userProfile?.metal_archives_url || userProfile?.metal_archives || '';
  });

  const [profileSceneCred, setProfileSceneCred] = useState(0);
  const [digitalTicketsScanned, setDigitalTicketsScanned] = useState(0);
  const [physicalMerchBought, setPhysicalMerchBought] = useState(0);
  const [bandsDiscovered, setBandsDiscovered] = useState(0);

  useEffect(() => {
    setProfileSceneCred(digitalTicketsScanned * 20 + physicalMerchBought * 50 + bandsDiscovered * 30);
  }, [digitalTicketsScanned, physicalMerchBought, bandsDiscovered]);

  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(() => {
    if (portalRole === 'fan_only') {
      return userProfile?.avatar_url || 'FL';
    }
    if (portalRole === 'label') return userProfile?.label_avatar || null;
    if (portalRole === 'creative') return userProfile?.creative_avatar || null;
    if (portalRole === 'promoter') return (userProfile as any)?.promoter_logo || null;
    if (portalRole === 'band') return activeBand?.logo_url || null;

    if (userProfile?.avatar_url && userProfile.avatar_url !== 'https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Nexus%20Icon%20Circuits.png') {
      return userProfile.avatar_url;
    }
    return userProfile?.avatar_url || null;
  });

  const [profileCoverUrl, setProfileCoverUrl] = useState<string | null>(() => {
    if (portalRole === 'fan_only') return userProfile?.banner_url || null;
    if (portalRole === 'label') return userProfile?.label_banner || null;
    if (portalRole === 'creative') return userProfile?.creative_banner || null;
    if (portalRole === 'promoter') return (userProfile as any)?.promoter_cover_image || null;
    if (portalRole === 'band') {
      const savedCover = activeBand ? localStorage.getItem(`nexus_core_band_cover_${activeBand.id}`) : null;
      return savedCover || activeBand?.cover_url || null;
    }

    if (userProfile?.banner_url) {
      return userProfile.banner_url;
    }
    return userProfile?.banner_url || null;
  });

  // Image Cropper & Adjuster States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [cropperType, setCropperType] = useState<'avatar' | 'cover'>('avatar');

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoadedRef.current) return;

    let avatar: string | null = null;
    if (portalRole === 'fan_only') {
      avatar = userProfile?.avatar_url || 'FL';
    } else if (portalRole === 'label') avatar = userProfile?.label_avatar || null;
    else if (portalRole === 'creative') avatar = userProfile?.creative_avatar || null;
    else if (portalRole === 'promoter') avatar = (userProfile as any)?.promoter_logo || null;
    else if (portalRole === 'band') avatar = activeBand?.logo_url || null;
    else {
      avatar = userProfile?.avatar_url || null;
    }

    setProfileAvatarUrl(avatar);
  }, [portalRole, userProfile?.avatar_url, userProfile?.label_avatar, userProfile?.creative_avatar, (userProfile as any)?.promoter_logo, userProfile?.email, activeBand?.logo_url]);

  useEffect(() => {
    if (isLoadedRef.current) return;

    let cover: string | null = null;
    if (portalRole === 'fan_only') {
      cover = userProfile?.banner_url || null;
    } else if (portalRole === 'label') cover = userProfile?.label_banner || null;
    else if (portalRole === 'creative') cover = userProfile?.creative_banner || null;
    else if (portalRole === 'promoter') cover = (userProfile as any)?.promoter_cover_image || null;
    else if (portalRole === 'band') {
      const savedCover = activeBand ? localStorage.getItem(`nexus_core_band_cover_${activeBand.id}`) : null;
      cover = savedCover || activeBand?.cover_url || null;
    } else {
      cover = userProfile?.banner_url || null;
    }

    setProfileCoverUrl(cover);
  }, [portalRole, userProfile?.banner_url, userProfile?.label_banner, userProfile?.creative_banner, (userProfile as any)?.promoter_cover_image, userProfile?.email, activeBand?.id, activeBand?.cover_url]);

  useEffect(() => {
    if (isLoadedRef.current) return;

    let name = '';
    if (portalRole === 'fan_only') {
      name = userProfile?.full_name || userProfile?.legal_name || userProfile?.screen_name || userProfile?.name || 'Fan Listener';
    } else if (portalRole === 'industry_pro') {
      name = userProfile?.full_name || userProfile?.legal_name || userProfile?.name || 'Industry Pro';
    } else if (portalRole === 'band') {
      name = activeBand?.name || userProfile?.bandName || '';
    } else if (portalRole === 'creative') {
      name = userProfile?.creative_metadata?.business_name || '';
    } else if (portalRole === 'promoter') {
      name = userProfile?.promoter_metadata?.brand_name || '';
    } else if (portalRole === 'label') {
      name = userProfile?.label_company_name || '';
    } else if (userProfile?.full_name || userProfile?.legal_name) {
      name = userProfile.full_name || userProfile.legal_name || '';
    } else if (userProfile?.name && userProfile.name !== 'New User' && userProfile.name !== '') {
      name = userProfile.name;
    } else {
      name = userProfile?.name || '';
    }

    if (name && name !== profileFullLegalName) {
      setProfileFullLegalName(name);
    }

    let handle = '';
    if (userProfile?.console_handle && userProfile.console_handle !== '') {
      handle = userProfile.console_handle;
    } else if (portalRole === 'fan_only') {
      handle = userProfile?.screen_name?.toLowerCase().replace(/\s+/g, '') || 'fan_core';
    } else if (portalRole === 'band') {
      handle = (activeBand?.name || userProfile?.bandName || '').toLowerCase().replace(/\s+/g, '') || '';
    } else if (portalRole === 'creative') {
      handle = userProfile?.creative_metadata?.business_name?.toLowerCase().replace(/\s+/g, '') || '';
    } else if (portalRole === 'promoter') {
      handle = userProfile?.promoter_metadata?.brand_name?.toLowerCase().replace(/\s+/g, '') || '';
    } else if (portalRole === 'label') {
      handle = userProfile?.label_url_slug || '';
    } else if (userProfile?.screen_name && userProfile.screen_name !== '') {
      handle = userProfile.screen_name.toLowerCase().replace(/\s+/g, '');
    } else if (userProfile?.name && userProfile.name !== 'New User' && userProfile.name !== '') {
      handle = userProfile.name.toLowerCase().replace(/\s+/g, '');
    } else {
      handle = 'fan_core';
    }

    if (handle && handle !== profileHandle) {
      setProfileHandle(handle);
    }
  }, [
    portalRole,
    userProfile?.name,
    userProfile?.screen_name,
    userProfile?.console_handle,
    userProfile?.bandName,
    activeBand?.name,
    userProfile?.creative_metadata?.business_name,
    userProfile?.promoter_metadata?.brand_name,
    userProfile?.label_company_name,
    userProfile?.label_url_slug,
    userProfile?.email
  ]);

  const [profileSceneRoles, setProfileSceneRoles] = useState<string[]>(() => {
    if (portalRole === 'band') return ['Artist'];
    if (portalRole === 'creative') return ['Creative'];
    if (portalRole === 'promoter') return ['Promoter'];
    if (portalRole === 'label') return ['Record Label'];
    return ['Purely a Supporter'];
  });

  const [profileBlurb, setProfileBlurb] = useState(() => {
    if (userProfile?.bio) return userProfile.bio;
    if (userProfile?.profileBlurb) return userProfile.profileBlurb;
    return '';
  });

  useEffect(() => {
    const freshBio = userProfile?.bio || userProfile?.profileBlurb;
    if (freshBio && freshBio !== profileBlurb) {
      setProfileBlurb(freshBio);
    }
  }, [userProfile?.bio, userProfile?.profileBlurb]);

  const [profileStealthMode, setProfileStealthMode] = useState(false);
  const [filterHideTicketPresales, setFilterHideTicketPresales] = useState(false);
  const [filterShowMerchDropsOnlyFromFollowed, setFilterShowMerchDropsOnlyFromFollowed] = useState(false);
  const [filterShowFollowedOnly, setFilterShowFollowedOnly] = useState(false);
  const [prefPushNotifications, setPrefPushNotifications] = useState(true);
  const [prefLocationServices, setPrefLocationServices] = useState(false);

  const saveProfileData = (finalSave: boolean = false) => {
    const combinedGenres = Array.from(new Set([
      ...profilePrimaryGenres,
      ...profileMicroGenres,
      ...profileGenres
    ])).filter(Boolean);

    const dataToSave = {
      profileFullLegalName,
      profileHandle,
      profileEmail,
      profilePassword,
      profilePin,
      profileLocation,
      profileGenres: combinedGenres,
      profilePrimaryGenres,
      profileMicroGenres,
      profileFavoriteSong,
      profileTopSongArtist,
      profileTopSongTitle,
      profileTopSongUrl,
      profileAvatarUrl,
      profileCoverUrl,
      profileSceneRoles,
      profileBlurb,
      profileStealthMode,
      filterHideTicketPresales,
      filterShowMerchDropsOnlyFromFollowed,
      filterShowFollowedOnly,
      prefPushNotifications,
      prefLocationServices,
      timestamp: Date.now()
    };

    const profileCacheKey = `nexus_${portalRole}_profile_v1_${userProfile?.id || 'guest'}`;

    try {
      const { profileAvatarUrl, profileCoverUrl, ...localData } = dataToSave;
      localStorage.setItem(profileCacheKey, JSON.stringify(localData));
      localStorage.setItem('nexus_user_bio', profileBlurb);
    } catch (err) {
      console.error("Failed to write to localStorage:", err);
    }

    try {
      profileStore.setItem(`active_${portalRole}_${userProfile?.id || 'guest'}`, dataToSave).catch(e => console.warn("profileStore write warning:", e));
    } catch (err) {
      console.warn("Failed to write to IndexedDB profileStore:", err);
    }

    if (userProfile?.id && userProfile?.id !== 'guest') {
      const supabase = getSupabase();
      if (supabase) {
        const fullTopSong = profileTopSongTitle
          ? (profileTopSongArtist ? `${profileTopSongArtist} - ${profileTopSongTitle}` : profileTopSongTitle)
          : profileFavoriteSong;

        const finalTopSongUrl = profileTopSongUrl.trim() || userProfile?.top_song_url || '';

        const isCreative = portalRole === 'creative' || userProfile?.account_type === 'creative';

        // 1. Separate Profile Payload: Update profiles table with ONLY global user fields
        const globalProfilePayload = extractGlobalProfilePayload({
          id: userProfile.id,
          email: userProfile.email || profileEmail,
          full_name: profileFullLegalName || userProfile?.full_name || userProfile?.legal_name || userProfile?.name || '',
          name: profileFullLegalName || userProfile?.full_name || userProfile?.legal_name || userProfile?.name || '',
          console_handle: profileHandle || userProfile?.console_handle || '@bdmCEO',
          bio: profileBlurb || userProfile?.bio || userProfile?.profileBlurb || '',
          genre_tags: combinedGenres,
          genres: combinedGenres,
          top_song_title: fullTopSong,
          favoriteSong: fullTopSong,
          top_song_url: finalTopSongUrl,
          avatar_url: profileAvatarUrl || userProfile?.avatar_url || null,
          banner_url: profileCoverUrl || userProfile?.banner_url || null,
          city: profileLocation,
          zip_code: profileZip,
          pin: profilePin,
          update_ticker: userProfile?.update_ticker || userProfile?.rosterTicker || 'No updates posted yet',
          creative_id: isCreative ? (userProfile?.creative_id || userProfile?.registered_creative_id) : undefined,
        }, userProfile.id);

        executeSanitizedProfileUpsert(
          supabase,
          globalProfilePayload
        ).then(({ error }) => {
          if (error) {
            console.error('[Supabase Profile Sync Error]:', error);
          } else {
            console.log('[Supabase Profile Sync Success] Global user profile saved.');
          }
        });
      }
    }
  };

  return {
    isLoadedRef,
    isPinModalOpen,
    setIsPinModalOpen,
    pinEntered,
    setPinEntered,
    pinError,
    setPinError,
    profileFullLegalName,
    setProfileFullLegalName,
    profileHandle,
    setProfileHandle,
    profileEmail,
    setProfileEmail,
    profilePassword,
    setProfilePassword,
    profilePin,
    setProfilePin,
    profileLocation,
    setProfileLocation,
    profileZip,
    setProfileZip,
    profileGenres,
    setProfileGenres,
    expandedClusters,
    setExpandedClusters,
    genreClusterExpanded,
    setGenreClusterExpanded,
    profilePrimaryGenres,
    setProfilePrimaryGenres,
    profileMicroGenres,
    setProfileMicroGenres,
    profileTopSongArtist,
    setProfileTopSongArtist,
    profileTopSongTitle,
    setProfileTopSongTitle,
    profileFavoriteSong,
    setProfileFavoriteSong,
    profileTopSongUrl,
    setProfileTopSongUrl,
    profileMetalArchivesUrl,
    setProfileMetalArchivesUrl,
    profileSceneCred,
    setProfileSceneCred,
    digitalTicketsScanned,
    setDigitalTicketsScanned,
    physicalMerchBought,
    setPhysicalMerchBought,
    bandsDiscovered,
    setBandsDiscovered,
    profileAvatarUrl,
    setProfileAvatarUrl,
    profileCoverUrl,
    setProfileCoverUrl,
    cropperOpen,
    setCropperOpen,
    cropperImageSrc,
    setCropperImageSrc,
    cropperType,
    setCropperType,
    avatarFileInputRef,
    coverFileInputRef,
    profileSceneRoles,
    setProfileSceneRoles,
    profileBlurb,
    setProfileBlurb,
    profileStealthMode,
    setProfileStealthMode,
    filterHideTicketPresales,
    setFilterHideTicketPresales,
    filterShowMerchDropsOnlyFromFollowed,
    setFilterShowMerchDropsOnlyFromFollowed,
    filterShowFollowedOnly,
    setFilterShowFollowedOnly,
    prefPushNotifications,
    setPrefPushNotifications,
    prefLocationServices,
    setPrefLocationServices,
    saveProfileData
  };
}
