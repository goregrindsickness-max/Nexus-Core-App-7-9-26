import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initialDiscoverProfiles } from '../data/discoverProfilesData';
import { getSupabase } from '../../../supabase';
import { getProfileGlowInfo } from '../../../utils/profileGlow';

export interface SuggestedProfile {
  id: string;
  raw_id?: string;
  user_id?: string;
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
  const roleLower = (profile.role || profile.portalRole || profile.category || '').toLowerCase();

  switch (glow.type) {
    case 'band':
      return {
        accentColor: '#10b981',
        borderClass: 'border-emerald-500/40 hover:border-emerald-400',
        activeBorder: 'border-emerald-500',
        bgClass: 'bg-emerald-950/20',
        glowShadow: 'hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]',
        badgeBg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400',
        avatarBorder: 'border-emerald-500/60 group-hover:border-emerald-400',
        icon: Music2,
        label: profile.role || 'Band / Artist'
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [localFollowedMap, setLocalFollowedMap] = useState<Record<string, boolean>>({});
  const [supabaseProfiles, setSupabaseProfiles] = useState<SuggestedProfile[]>([]);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(false);

  // Fetch real profiles from Supabase tables (profiles, bands, creatives, labels, promoters)
  useEffect(() => {
    let isMounted = true;
    const fetchAllSupabaseProfiles = async () => {
      const client = getSupabase();
      if (!client) return;

      setIsLoadingSupabase(true);
      const fetched: SuggestedProfile[] = [];

      try {
        // 1. Fetch from 'profiles' table
        const { data: pData } = await client.from('profiles').select('*').limit(30);
        if (pData && isMounted) {
          pData.forEach((p: any) => {
            const pName = p.full_name || p.display_name || p.name || p.console_handle || p.email?.split('@')[0];
            if (!pName) return;

            let role = p.role || p.account_type || 'Member';
            let cat = 'fans';
            if (p.account_type === 'band' || p.bandName) { role = 'Band'; cat = 'bands'; }
            else if (p.account_type === 'creative') { role = 'Creative'; cat = 'creatives'; }
            else if (p.account_type === 'label' || p.label_company_name) { role = 'Record Label'; cat = 'labels'; }
            else if (p.account_type === 'promoter') { role = 'Promoter'; cat = 'venues'; }

            fetched.push({
              id: `db-p-${p.id || p.email}`,
              raw_id: p.id,
              user_id: p.id,
              name: p.bandName || p.label_company_name || pName,
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

        // 2. Fetch from 'bands' table
        const { data: bData } = await client.from('bands').select('*').limit(25);
        if (bData && isMounted) {
          bData.forEach((b: any) => {
            const bName = b.band_name || b.name;
            if (!bName) return;
            fetched.push({
              id: `db-b-${b.id}`,
              raw_id: b.id,
              user_id: b.user_id || b.creator_id,
              name: bName,
              role: 'Band',
              category: 'bands',
              genre: b.genre,
              desc: b.genre || b.bio || 'Underground Heavy Music Artist',
              avatar: b.logo_url || b.cover_url || '',
              image: b.logo_url || b.cover_url || '',
              isBandProfile: true,
              followed: false
            });
          });
        }

        // 3. Fetch from 'creatives' table
        const { data: cData } = await client.from('creatives').select('*').limit(25);
        if (cData && isMounted) {
          cData.forEach((c: any) => {
            const cName = c.business_name || c.creative_name || c.name;
            if (!cName) return;
            fetched.push({
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

        // 4. Fetch from 'labels' table
        const { data: lData } = await client.from('labels').select('*').limit(25);
        if (lData && isMounted) {
          lData.forEach((l: any) => {
            const lName = l.label_company_name || l.label_name || l.name;
            if (!lName) return;
            fetched.push({
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

        // 5. Fetch from 'promoters' table
        const { data: prData } = await client.from('promoters').select('*').limit(25);
        if (prData && isMounted) {
          prData.forEach((pr: any) => {
            const prName = pr.brand_name || pr.agency_name || pr.promoter_name || pr.name;
            if (!prName) return;
            fetched.push({
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

        if (isMounted && fetched.length > 0) {
          setSupabaseProfiles(fetched);
        }
      } catch (err) {
        console.warn('Could not load extra profiles from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingSupabase(false);
      }
    };

    fetchAllSupabaseProfiles();
    return () => { isMounted = false; };
  }, []);

  // Merge discoverProfiles prop, live Supabase profiles, and default fallback dataset
  const combinedProfiles = useMemo(() => {
    const pool = [
      ...(discoverProfiles || []),
      ...(supabaseProfiles || []),
      ...initialDiscoverProfiles
    ];

    const unique: SuggestedProfile[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    for (const item of pool) {
      const p = item as any;
      if (!p || !p.name) continue;
      const lowerName = String(p.name).trim().toLowerCase();
      const pId = String(p.id || p.raw_id || '');

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
  }, [discoverProfiles, supabaseProfiles, currentUserId, currentUserName, dismissedIds]);

  // Filter by category
  const filteredProfiles = useMemo(() => {
    return combinedProfiles.filter(p => {
      if (selectedCategory === 'all') return true;
      const cat = p.category?.toLowerCase() || '';
      const roleStr = (p.role || '').toLowerCase();
      if (selectedCategory === 'bands') return cat === 'bands' || roleStr.includes('band') || roleStr.includes('artist');
      if (selectedCategory === 'venues') return cat === 'venues' || roleStr.includes('venue') || roleStr.includes('promoter') || roleStr.includes('buyer');
      if (selectedCategory === 'creatives') return cat === 'creatives' || roleStr.includes('creative') || roleStr.includes('designer') || roleStr.includes('photo');
      if (selectedCategory === 'labels') return cat === 'labels' || roleStr.includes('label');
      if (selectedCategory === 'fans') return cat === 'fans' || roleStr.includes('fan') || roleStr.includes('listener');
      return true;
    });
  }, [combinedProfiles, selectedCategory]);

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
    { id: 'bands', label: 'Bands', color: '#10b981' },
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
      <div className="absolute top-0 right-1/4 w-72 h-20 bg-gradient-to-r from-[#00ffcc]/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-7 h-7 rounded-lg bg-[#00ffcc]/10 border border-[#00ffcc]/30 flex items-center justify-center text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]"
          >
            <Users className="w-3.5 h-3.5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-zinc-100 tracking-wide font-sans">
                People You May Know
              </h3>
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#00ffcc] bg-[#00ffcc]/10 border border-[#00ffcc]/30 px-1.5 py-0.2 rounded-full">
                Discover
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-sans leading-none mt-0.5">
              Recommended artists, venues, creatives & fans
            </p>
          </div>
        </div>

        {/* Categories & Carousel Navigation */}
        <div className="flex items-center gap-1.5 justify-between sm:justify-end">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {categories.map((cat, catIdx) => {
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
        className="flex gap-2.5 overflow-x-auto scrollbar-none py-1 px-0.5 scroll-smooth select-none items-stretch"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <AnimatePresence mode="popLayout">
          {filteredProfiles.map((profile, pIdx) => {
            const isFollowed = localFollowedMap[profile.id] !== undefined
              ? localFollowedMap[profile.id]
              : Boolean(profile.followed);

            const theme = getRoleTheme(profile);
            const RoleIcon = theme.icon;

            return (
              <motion.div
                key={`pymk-${profile.id || profile.name || 'user'}-${pIdx}`}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`w-[154px] min-w-[154px] max-w-[154px] bg-[#11131a] border ${theme.borderClass} ${theme.glowShadow} rounded-xl p-2.5 flex flex-col justify-between items-center text-center relative group transition-all duration-200 shadow-md overflow-hidden`}
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
                  onClick={() => onOpenProfile?.(profile.raw_id || profile.id, profile.name)}
                >
                  {/* Compact Avatar with Role Colored Ring */}
                  <div className="relative mb-1.5 mt-0.5">
                    <motion.div 
                      whileHover={{ scale: 1.08 }}
                      className={`w-11 h-11 rounded-full bg-zinc-900 border-2 ${theme.avatarBorder} overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-inner transition-all`}
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

                    {/* Followed Status Checkmark */}
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
                    className="font-bold text-[11px] text-zinc-100 group-hover:text-white transition-colors truncate max-w-[136px] leading-tight"
                    title={profile.name}
                  >
                    {profile.name}
                  </h4>

                  {/* Role Badge with Colored Border & Icon */}
                  <div 
                    className={`text-[8.5px] font-semibold mt-1 px-1.5 py-0.5 rounded border flex items-center gap-1 max-w-[136px] truncate ${theme.badgeBg}`}
                  >
                    <RoleIcon className="w-2.5 h-2.5 shrink-0" style={{ color: theme.accentColor }} />
                    <span className="truncate">{theme.label}</span>
                  </div>

                  {/* Description / Bio / Specialty */}
                  <p 
                    className="text-[9.5px] text-zinc-400 line-clamp-2 h-[24px] my-1.5 leading-tight px-0.5 font-sans"
                    title={profile.desc || profile.genre || profile.location}
                  >
                    {profile.desc || profile.genre || profile.location || 'Independent music scene'}
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
                    onClick={() => onOpenProfile?.(profile.raw_id || profile.id, profile.name)}
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
