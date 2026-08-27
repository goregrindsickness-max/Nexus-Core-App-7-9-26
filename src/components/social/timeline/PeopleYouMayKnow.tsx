import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  Sparkles, 
  UserPlus, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ExternalLink,
  MapPin,
  Music2,
  Check,
  Building2,
  Palette,
  Disc3,
  Radio,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initialDiscoverProfiles } from '../data/discoverProfilesData';
import { getSupabase } from '../../../supabase';
import { getProfileGlowInfo } from '../../../utils/profileGlow';
import { communityBandManager } from '../../../lib/communityBands';

export interface SuggestedProfile {
  id: string;
  raw_id?: string;
  user_id?: string;
  band_id?: string;
  name: string;
  role?: string;
  portalRole?: string;
  type?: string;
  category?: 'bands' | 'venues' | 'creatives' | 'labels' | 'fans' | string;
  desc?: string;
  avatar?: string;
  image?: string;
  banner?: string;
  location?: string;
  genre?: string;
  followed?: boolean;
  followedBack?: boolean;
  isBandProfile?: boolean;
  isRealBand?: boolean;
  is_community_archive?: boolean;
  verification_status?: string;
  followers_count?: number;
  registered_workspaces?: string[];
  allowed_workspaces?: string[];
  account_type?: string;
}

interface PeopleYouMayKnowProps {
  discoverProfiles?: SuggestedProfile[];
  currentUserId?: string;
  currentUserName?: string;
  onOpenProfile?: (authorId: string, authorName: string) => void;
  onFollowProfile?: (profile: any) => void;
  onTriggerNotification?: (msg: string) => void;
}

// Role-based theme styling helper
const getRoleTheme = (profile: SuggestedProfile) => {
  const glow = getProfileGlowInfo(profile);
  const isReal = profile.isRealBand || profile.isBandProfile || profile.category === 'bands';

  switch (glow.type) {
    case 'band':
      return {
        accentColor: '#10b981',
        borderClass: isReal ? 'border-emerald-500/60 hover:border-emerald-400' : 'border-emerald-500/40 hover:border-emerald-400',
        activeBorder: 'border-emerald-500',
        bgClass: 'bg-emerald-950/20',
        glowShadow: 'hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]',
        badgeBg: isReal ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300' : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400',
        avatarBorder: 'border-emerald-500/70 group-hover:border-emerald-400',
        icon: Music2,
        label: profile.role || (profile.verification_status === 'community_archive' ? 'Archive Band' : 'Official Band')
      };
    case 'promoter':
      return {
        accentColor: '#eab308',
        borderClass: 'border-amber-500/40 hover:border-amber-400',
        activeBorder: 'border-amber-500',
        bgClass: 'bg-amber-950/20',
        glowShadow: 'hover:shadow-[0_0_16px_rgba(234,179,8,0.3)]',
        badgeBg: 'bg-amber-950/70 border-amber-500/40 text-amber-400',
        avatarBorder: 'border-amber-500/60 group-hover:border-amber-400',
        icon: Building2,
        label: profile.role || 'Promoter / Venue'
      };
    case 'creative':
      return {
        accentColor: '#ec4899',
        borderClass: 'border-pink-500/40 hover:border-pink-400',
        activeBorder: 'border-pink-500',
        bgClass: 'bg-pink-950/20',
        glowShadow: 'hover:shadow-[0_0_16px_rgba(236,72,153,0.3)]',
        badgeBg: 'bg-pink-950/70 border-pink-500/40 text-pink-400',
        avatarBorder: 'border-pink-500/60 group-hover:border-pink-400',
        icon: Palette,
        label: profile.role || 'Creative Pro'
      };
    case 'label':
      return {
        accentColor: '#f97316',
        borderClass: 'border-orange-500/40 hover:border-orange-400',
        activeBorder: 'border-orange-500',
        bgClass: 'bg-orange-950/20',
        glowShadow: 'hover:shadow-[0_0_16px_rgba(249,115,22,0.3)]',
        badgeBg: 'bg-orange-950/70 border-orange-500/40 text-orange-400',
        avatarBorder: 'border-orange-500/60 group-hover:border-orange-400',
        icon: Disc3,
        label: profile.role || 'Record Label'
      };
    case 'industry_pro':
      return {
        accentColor: '#a855f7',
        borderClass: 'border-purple-500/40 hover:border-purple-400',
        activeBorder: 'border-purple-500',
        bgClass: 'bg-purple-950/20',
        glowShadow: 'hover:shadow-[0_0_16px_rgba(168,85,247,0.3)]',
        badgeBg: 'bg-purple-950/70 border-purple-500/40 text-purple-400',
        avatarBorder: 'border-purple-500/60 group-hover:border-purple-400',
        icon: Radio,
        label: profile.role || 'Industry Pro'
      };
    case 'fan':
    default:
      return {
        accentColor: '#00ffcc',
        borderClass: 'border-cyan-500/40 hover:border-cyan-300',
        activeBorder: 'border-[#00ffcc]',
        bgClass: 'bg-cyan-950/20',
        glowShadow: 'hover:shadow-[0_0_16px_rgba(0,255,204,0.3)]',
        badgeBg: 'bg-cyan-950/70 border-cyan-500/40 text-[#00ffcc]',
        avatarBorder: 'border-cyan-500/60 group-hover:border-[#00ffcc]',
        icon: Flame,
        label: profile.role || 'Fan Listener'
      };
  }
};

export const PeopleYouMayKnow: React.FC<PeopleYouMayKnowProps> = ({
  discoverProfiles = [],
  currentUserId,
  currentUserName,
  onOpenProfile,
  onFollowProfile,
  onTriggerNotification,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('bands');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [localFollowedMap, setLocalFollowedMap] = useState<Record<string, boolean>>({});
  const [realBands, setRealBands] = useState<SuggestedProfile[]>(() => {
    try {
      const commBands = communityBandManager.getAll();
      return commBands.map((cb) => {
        const cbName = cb.name || cb.band_name;
        const cbLocationParts = [cb.city, cb.state || cb.state_province, cb.country].filter(Boolean);
        const cbLocationStr = cbLocationParts.length > 0 ? cbLocationParts.join(', ') : undefined;
        const cbAvatar = cb.avatar_url || cb.logo_url || cb.avatar || cb.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300';
        return {
          id: cb.id.startsWith('comm-') || cb.id.startsWith('db-') ? cb.id : `comm-band-${cb.id}`,
          raw_id: cb.id,
          band_id: cb.id,
          user_id: cb.creator_id || cb.claimed_by_user_id,
          name: cbName || 'Band',
          role: cb.verification_status === 'verified_official' ? 'Official Band' : 'Band',
          portalRole: 'band',
          category: 'bands',
          genre: cb.genre || 'Underground Metal',
          location: cbLocationStr,
          desc: cb.bio || `${cb.genre || 'Metal'}${cbLocationStr ? ` • ${cbLocationStr}` : ''}`,
          avatar: cbAvatar,
          image: cbAvatar,
          banner: cb.cover_url || cb.banner_url || '',
          isBandProfile: true,
          isRealBand: true,
          is_community_archive: cb.verification_status === 'community_archive',
          verification_status: cb.verification_status,
          followers_count: cb.followers_count || 120,
          followed: false
        };
      });
    } catch {
      return [];
    }
  });
  const [supabaseProfiles, setSupabaseProfiles] = useState<SuggestedProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch real bands from 'bands' table and other profiles from Supabase tables
  const fetchAllProfilesAndBands = useCallback(async () => {
    const fetchedBands: SuggestedProfile[] = [];
    const fetchedOther: SuggestedProfile[] = [];

    // Always load community bands first so list is never empty
    try {
      const commBands = communityBandManager.getAll();
      commBands.forEach((cb) => {
        const cbName = cb.name || cb.band_name;
        if (!cbName) return;
        const cbLocationParts = [cb.city, cb.state || cb.state_province, cb.country].filter(Boolean);
        const cbLocationStr = cbLocationParts.length > 0 ? cbLocationParts.join(', ') : undefined;
        const cbAvatar = cb.avatar_url || cb.logo_url || cb.avatar || cb.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300';

        fetchedBands.push({
          id: cb.id.startsWith('comm-') || cb.id.startsWith('db-') ? cb.id : `comm-band-${cb.id}`,
          raw_id: cb.id,
          band_id: cb.id,
          user_id: cb.creator_id || cb.claimed_by_user_id,
          name: cbName,
          role: cb.verification_status === 'verified_official' ? 'Official Band' : 'Band',
          portalRole: 'band',
          category: 'bands',
          genre: cb.genre || 'Underground Metal',
          location: cbLocationStr,
          desc: cb.bio || `${cb.genre || 'Metal'}${cbLocationStr ? ` • ${cbLocationStr}` : ''}`,
          avatar: cbAvatar,
          image: cbAvatar,
          banner: cb.cover_url || cb.banner_url || '',
          isBandProfile: true,
          isRealBand: true,
          is_community_archive: cb.verification_status === 'community_archive',
          verification_status: cb.verification_status,
          followers_count: cb.followers_count || 120,
          followed: false
        });
      });
    } catch (e) {
      console.warn('Error loading community bands:', e);
    }

    const client = getSupabase();
    if (!client) {
      setRealBands(fetchedBands);
      return;
    }

    setIsLoading(true);

    try {
      // 1. PRIMARY: Fetch real bands directly from 'bands' table
      const { data: bData, error: bError } = await client
        .from('bands')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);

      if (bData && !bError && Array.isArray(bData)) {
        bData.forEach((b: any) => {
          const bName = b.band_name || b.name;
          if (!bName) return;

          const locationParts = [b.city, b.state || b.state_province, b.country].filter(Boolean);
          const locationStr = locationParts.length > 0 ? locationParts.join(', ') : undefined;
          const genreStr = b.genre || (Array.isArray(b.subgenres) ? b.subgenres.join(' / ') : b.sub_genres) || b.micro_genres || 'Heavy Metal';
          const avatarUrl = b.logo_url || b.avatar_url || b.avatar || b.image || b.cover_url || b.banner_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300';
          const bannerUrl = b.cover_url || b.banner_url || '';
          const isArchive = b.verification_status === 'community_archive';

          if (!fetchedBands.some(fb => fb.name.toLowerCase() === bName.toLowerCase())) {
            fetchedBands.push({
              id: `db-band-${b.id}`,
              raw_id: b.id,
              band_id: b.id,
              user_id: b.user_id || b.creator_id || b.owner_id || b.profile_id,
              name: bName,
              role: isArchive ? 'Archive Band' : 'Band',
              portalRole: 'band',
              category: 'bands',
              genre: genreStr,
              location: locationStr,
              desc: b.bio || b.description || `${genreStr}${locationStr ? ` • ${locationStr}` : ''}`,
              avatar: avatarUrl,
              image: avatarUrl,
              banner: bannerUrl,
              isBandProfile: true,
              isRealBand: true,
              is_community_archive: isArchive,
              verification_status: b.verification_status || 'verified_official',
              followers_count: b.followers_count || 150,
              followed: false
            });
          }
        });
      }

      // 3. Fetch user profiles from 'profiles' table
      const { data: pData } = await client.from('profiles').select('*').limit(30);
      if (pData && Array.isArray(pData)) {
        pData.forEach((p: any) => {
          const pName = p.full_name || p.display_name || p.name || p.console_handle || p.email?.split('@')[0];
          if (!pName) return;

          let role = p.role || p.account_type || 'Member';
          let cat = 'fans';
          if (p.account_type === 'band' || p.bandName) { role = 'Band'; cat = 'bands'; }
          else if (p.account_type === 'creative') { role = 'Creative'; cat = 'creatives'; }
          else if (p.account_type === 'label' || p.label_company_name) { role = 'Record Label'; cat = 'labels'; }
          else if (p.account_type === 'promoter') { role = 'Promoter'; cat = 'venues'; }

          // If this profile represents a band and wasn't added yet
          if (cat === 'bands') {
            if (!fetchedBands.some(fb => fb.name.toLowerCase() === (p.bandName || pName).toLowerCase())) {
              fetchedBands.push({
                id: `db-p-band-${p.id}`,
                raw_id: p.id,
                user_id: p.id,
                name: p.bandName || pName,
                role: 'Band',
                portalRole: 'band',
                category: 'bands',
                desc: p.bio || 'Artist Profile',
                avatar: p.avatar_url || p.avatar || '',
                image: p.avatar_url || p.avatar || '',
                banner: p.banner_url || '',
                isBandProfile: true,
                isRealBand: true,
                followed: false,
                account_type: p.account_type
              });
            }
            return;
          }

          fetchedOther.push({
            id: `db-p-${p.id || p.email}`,
            raw_id: p.id,
            user_id: p.id,
            name: p.label_company_name || p.business_name || p.agency_name || pName,
            role: role,
            category: cat,
            desc: p.bio || `${role} on Nexus`,
            avatar: p.avatar_url || p.avatar || '',
            image: p.avatar_url || p.avatar || '',
            banner: p.banner_url || '',
            followed: false,
            account_type: p.account_type
          });
        });
      }

      // 4. Fetch from 'creatives' table
      const { data: cData } = await client.from('creatives').select('*').limit(20);
      if (cData && Array.isArray(cData)) {
        cData.forEach((c: any) => {
          const cName = c.business_name || c.creative_name || c.name;
          if (!cName) return;
          fetchedOther.push({
            id: `db-c-${c.id}`,
            raw_id: c.id,
            user_id: c.user_id || c.creator_id,
            name: cName,
            role: 'Creative Pro',
            category: 'creatives',
            desc: c.specialty || c.bio || 'Creative Design Specialist',
            avatar: c.avatar_url || c.image || c.creative_avatar || '',
            image: c.avatar_url || c.image || c.creative_avatar || '',
            followed: false
          });
        });
      }

      // 5. Fetch from 'labels' table
      const { data: lData } = await client.from('labels').select('*').limit(20);
      if (lData && Array.isArray(lData)) {
        lData.forEach((l: any) => {
          const lName = l.label_company_name || l.label_name || l.name;
          if (!lName) return;
          fetchedOther.push({
            id: `db-l-${l.id}`,
            raw_id: l.id,
            user_id: l.user_id || l.creator_id,
            name: lName,
            role: 'Record Label',
            category: 'labels',
            desc: l.description || l.headquarters || 'Independent Record Label',
            avatar: l.label_avatar || l.avatar_url || l.logo_url || '',
            image: l.label_avatar || l.avatar_url || l.logo_url || '',
            followed: false
          });
        });
      }

      // 6. Fetch from 'promoters' table
      const { data: prData } = await client.from('promoters').select('*').limit(20);
      if (prData && Array.isArray(prData)) {
        prData.forEach((pr: any) => {
          const prName = pr.brand_name || pr.agency_name || pr.promoter_name || pr.name;
          if (!prName) return;
          fetchedOther.push({
            id: `db-pr-${pr.id}`,
            raw_id: pr.id,
            user_id: pr.user_id || pr.creator_id,
            name: prName,
            role: 'Promoter / Venue',
            category: 'venues',
            desc: pr.region || pr.description || 'Live Venue & Tour Booking',
            avatar: pr.promoter_logo || pr.logo_url || pr.avatar_url || '',
            image: pr.promoter_logo || pr.logo_url || pr.avatar_url || '',
            followed: false
          });
        });
      }

      setRealBands(fetchedBands);
      setSupabaseProfiles(fetchedOther);
    } catch (err) {
      console.warn('Notice loading profiles/bands from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProfilesAndBands();

    // Event listeners to refresh when real bands are added, edited, or claimed
    const handleUpdate = () => {
      fetchAllProfilesAndBands();
    };

    window.addEventListener('nexus_community_bands_updated', handleUpdate);
    window.addEventListener('nexus_band_created', handleUpdate);
    window.addEventListener('nexus_avatar_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nexus_community_bands_updated', handleUpdate);
      window.removeEventListener('nexus_band_created', handleUpdate);
      window.removeEventListener('nexus_avatar_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchAllProfilesAndBands]);

  // Merge REAL BANDS from bands table FIRST, then Supabase profiles, discoverProfiles prop, and fallbacks
  const combinedProfiles = useMemo(() => {
    const pool = [
      ...realBands, // 🎸 Real Bands from Supabase bands table placed FIRST
      ...(supabaseProfiles || []),
      ...(discoverProfiles || []),
      ...initialDiscoverProfiles
    ];

    const unique: SuggestedProfile[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    for (const item of pool) {
      const p = item as any;
      if (!p || !p.name) continue;
      const lowerName = String(p.name).trim().toLowerCase();
      const pId = String(p.id || p.raw_id || p.band_id || '');

      // Exclude current user
      if (currentUserId && (p.id === currentUserId || p.raw_id === currentUserId || p.user_id === currentUserId)) continue;
      if (currentUserName && lowerName === currentUserName.trim().toLowerCase()) continue;
      if (dismissedIds.has(p.id)) continue;

      if (!seenNames.has(lowerName) && (!pId || !seenIds.has(pId))) {
        seenNames.add(lowerName);
        if (pId) seenIds.add(pId);
        unique.push(p as SuggestedProfile);
      }
    }

    return unique;
  }, [realBands, supabaseProfiles, discoverProfiles, currentUserId, currentUserName, dismissedIds]);

  // Filter by category
  const filteredProfiles = useMemo(() => {
    if (selectedCategory === 'all') {
      return combinedProfiles;
    }

    const list = combinedProfiles.filter(p => {
      const cat = p.category?.toLowerCase() || '';
      const roleStr = (p.role || '').toLowerCase();
      if (selectedCategory === 'bands') {
        return Boolean(p.isBandProfile || p.isRealBand || cat === 'bands' || roleStr.includes('band') || roleStr.includes('artist'));
      }
      if (selectedCategory === 'venues') {
        return Boolean(cat === 'venues' || roleStr.includes('venue') || roleStr.includes('promoter') || roleStr.includes('buyer'));
      }
      if (selectedCategory === 'creatives') {
        return Boolean(cat === 'creatives' || roleStr.includes('creative') || roleStr.includes('designer') || roleStr.includes('photo'));
      }
      if (selectedCategory === 'labels') {
        return Boolean(cat === 'labels' || roleStr.includes('label'));
      }
      if (selectedCategory === 'fans') {
        return Boolean(cat === 'fans' || roleStr.includes('fan') || roleStr.includes('listener'));
      }
      return true;
    });

    if (selectedCategory === 'bands') {
      return list.length > 0 ? list : realBands;
    }

    return list;
  }, [combinedProfiles, selectedCategory, realBands]);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [filteredProfiles.length, selectedCategory]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 280;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const handleToggleFollow = (profile: SuggestedProfile) => {
    const isCurrentlyFollowed = localFollowedMap[profile.id] !== undefined
      ? localFollowedMap[profile.id]
      : Boolean(profile.followed);

    const nextState = !isCurrentlyFollowed;
    setLocalFollowedMap(prev => ({ ...prev, [profile.id]: nextState }));

    if (onFollowProfile) {
      onFollowProfile(profile);
    } else if (onTriggerNotification) {
      onTriggerNotification(nextState ? `Now following ${profile.name}!` : `Unfollowed ${profile.name}`);
    }
  };

  if (filteredProfiles.length === 0 && dismissedIds.size > 0) {
    return null;
  }

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'bands', label: `Bands${realBands.length > 0 ? ` (${realBands.length})` : ''}`, color: '#10b981' },
    { id: 'venues', label: 'Venues', color: '#eab308' },
    { id: 'creatives', label: 'Creatives', color: '#ec4899' },
    { id: 'labels', label: 'Labels', color: '#f97316' },
    { id: 'fans', label: 'Fans', color: '#00ffcc' }
  ];

  return (
    <div 
      id="people-you-may-know-section"
      className="bg-[#0b0d13]/95 border border-zinc-800/90 rounded-xl p-3 my-4 shadow-2xl relative overflow-hidden group/container backdrop-blur-md"
    >
      {/* Dynamic ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-20 bg-gradient-to-r from-[#00ffcc]/10 via-emerald-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <Music2 className="w-3.5 h-3.5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-zinc-100 tracking-wide font-sans">
                People & Bands You May Know
              </h3>
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                <Sparkles className="w-2 h-2" />
                Featured Artists
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-sans leading-none mt-0.5">
              Discover real bands, artists, venues, and creatives from the scene
            </p>
          </div>
        </div>

        {/* Categories & Carousel Navigation */}
        <div className="flex items-center gap-1.5 justify-between sm:justify-end">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-md transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-zinc-600 font-bold shadow-[0_0_8px_rgba(255,255,255,0.1)]'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:border-zinc-700'
                  }`}
                  style={isSelected && cat.color ? { borderColor: `${cat.color}66`, color: cat.color } : {}}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft 
                  ? 'bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 active:scale-90' 
                  : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/40 cursor-not-allowed opacity-30'
              }`}
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight 
                  ? 'bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 active:scale-90' 
                  : 'bg-zinc-900/40 text-zinc-600 border border-zinc-800/40 cursor-not-allowed opacity-30'
              }`}
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-2.5 overflow-x-auto scrollbar-none py-1.5 px-0.5 scroll-smooth select-none items-center min-h-[210px]"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <AnimatePresence mode="popLayout">
          {filteredProfiles.map((profile, pIdx) => {
            const isFollowed = localFollowedMap[profile.id] !== undefined
              ? localFollowedMap[profile.id]
              : Boolean(profile.followed);

            const theme = getRoleTheme(profile);
            const RoleIcon = theme.icon;
            const isBand = profile.isBandProfile || profile.category === 'bands';

            return (
              <motion.div
                key={`pymk-${profile.id || profile.name || 'user'}-${pIdx}`}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`w-[158px] min-w-[158px] max-w-[158px] h-[200px] min-h-[200px] bg-[#11131a] border ${theme.borderClass} ${theme.glowShadow} rounded-xl p-2.5 flex flex-col justify-between items-center text-center relative group transition-all duration-200 shadow-md overflow-hidden`}
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Top Accent Color Bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: theme.accentColor }}
                />

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(profile.id);
                  }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-zinc-900/90 text-zinc-500 hover:text-white hover:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-2.5 h-2.5" />
                </button>

                {/* Profile Top Content (Clickable) */}
                <div 
                  className="w-full flex flex-col items-center cursor-pointer"
                  onClick={() => onOpenProfile?.(profile.raw_id || profile.band_id || profile.id, profile.name)}
                >
                  {/* Compact Avatar with Role Colored Ring */}
                  <div className="relative mb-1.5 mt-0.5">
                    <motion.div 
                      whileHover={{ scale: 1.08 }}
                      className={`w-12 h-12 rounded-full bg-zinc-900 border-2 ${theme.avatarBorder} overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-inner transition-all relative`}
                    >
                      {profile.image || profile.avatar ? (
                        <img 
                          src={profile.image || profile.avatar} 
                          alt={profile.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.initial-fallback')) {
                              const span = document.createElement('span');
                              span.className = 'initial-fallback font-bold text-zinc-300 text-xs';
                              span.innerText = (profile.name.slice(0, 2)).toUpperCase();
                              parent.appendChild(span);
                            }
                          }}
                        />
                      ) : (
                        <span className="font-bold text-zinc-300 text-xs">
                          {profile.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </motion.div>

                    {/* Band Official / Followed Badge Overlay */}
                    {isBand && (
                      <div 
                        className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center shadow-sm"
                        title="Band / Artist"
                      >
                        <Music2 className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                    )}

                    {isFollowed && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#11131a] flex items-center justify-center shadow-sm"
                      >
                        <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Profile Name */}
                  <h4 
                    className="font-bold text-[11px] text-zinc-100 group-hover:text-white transition-colors truncate max-w-[140px] leading-tight flex items-center justify-center gap-1"
                    title={profile.name}
                  >
                    <span className="truncate">{profile.name}</span>
                    {isBand && (
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0 inline opacity-90" />
                    )}
                  </h4>

                  {/* Role Badge with Colored Border & Icon */}
                  <div 
                    className={`text-[8.5px] font-semibold mt-1 px-1.5 py-0.5 rounded border flex items-center gap-1 max-w-[140px] truncate ${theme.badgeBg}`}
                  >
                    <RoleIcon className="w-2.5 h-2.5 shrink-0" style={{ color: theme.accentColor }} />
                    <span className="truncate">{theme.label}</span>
                  </div>

                  {/* Location or Genre Indicator */}
                  {profile.location && (
                    <div className="flex items-center gap-0.5 text-[8px] font-mono text-zinc-400 truncate max-w-[140px] mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}

                  {/* Description / Bio / Specialty */}
                  <p 
                    className="text-[9.5px] text-zinc-400 line-clamp-2 h-[24px] my-1 leading-tight px-0.5 font-sans"
                    title={profile.desc || profile.genre || profile.location}
                  >
                    {profile.desc || profile.genre || profile.location || 'Underground music scene'}
                  </p>
                </div>

                {/* Actions */}
                <div className="w-full space-y-1 mt-auto pt-0.5">
                  {/* Follow Button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFollow(profile);
                    }}
                    className={`w-full py-1 px-2 rounded-md text-[10.5px] font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                      isFollowed
                        ? 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80'
                        : isBand 
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                          : 'bg-[#00ffcc] hover:bg-[#00e6b8] text-black shadow-[0_0_10px_rgba(0,255,204,0.25)] hover:shadow-[0_0_14px_rgba(0,255,204,0.4)]'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </motion.button>

                  {/* Profile Link */}
                  <button
                    type="button"
                    onClick={() => onOpenProfile?.(profile.raw_id || profile.band_id || profile.id, profile.name)}
                    className="w-full py-0.5 text-[9px] text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-0.5 font-medium cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-2 h-2 opacity-60" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
