import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ShoppingCart,
  User,
  Settings,
  Search,
  Filter,
  X,
  Lock,
  ChevronDown,
  Home,
  ShoppingBag,
  Users,
  Camera,
  Video,
  MessageSquare,
  Bell
} from 'lucide-react';
import { BAND_PORTAL_BILLING } from '../../../config/billingMatrix';
import { hasRegisteredWorkspace, normalizeRegisteredWorkspaces } from '../../../types';

export interface FeedTopHeaderProps {
  isEmbedded?: boolean;
  onBack?: () => void;
  adminClickCount: number;
  setAdminClickCount: React.Dispatch<React.SetStateAction<number>>;
  setShowAdminPINModal: (val: boolean) => void;
  adminPINRef: React.MutableRefObject<any>;
  setIsCartOpen: (val: boolean) => void;
  cartItems: any[];
  profileFullLegalName: string;
  roleMenuOpen: boolean;
  setRoleMenuOpen: (val: boolean) => void;
  portalRole: string;
  userProfile?: any;
  setUserProfile?: (val: any) => void;
  activeBand?: any;
  getRoleBorderAndGlowClass: (role: string) => string;
  unreadNotifsCount: number;
  setRightDrawerOpen: (val: boolean) => void;
  setLeftDrawerOpen: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (val: any) => void;
  showSceneRadio: boolean;
  setShowSceneRadio: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearchQuery: string;
  setGlobalSearchQuery: (val: string) => void;
  searchResults?: any[];
  allProfiles: any[];
  discoverProfiles: any[];
  handleGlobalSearchFollowToggle: (id: string, name?: string) => void;
  getSupabase: () => any;
  triggerNotification?: (msg: string) => void;
  onLogout?: () => void;
}

export const FeedTopHeader: React.FC<FeedTopHeaderProps> = ({
  isEmbedded,
  onBack,
  adminClickCount,
  setAdminClickCount,
  setShowAdminPINModal,
  adminPINRef,
  setIsCartOpen,
  cartItems,
  profileFullLegalName,
  roleMenuOpen,
  setRoleMenuOpen,
  portalRole,
  userProfile,
  setUserProfile,
  activeBand,
  getRoleBorderAndGlowClass,
  unreadNotifsCount,
  setRightDrawerOpen,
  setLeftDrawerOpen,
  activeTab,
  setActiveTab,
  showSceneRadio,
  setShowSceneRadio,
  globalSearchQuery,
  setGlobalSearchQuery,
  searchResults = [],
  allProfiles,
  discoverProfiles,
  handleGlobalSearchFollowToggle,
  getSupabase,
  triggerNotification,
  onLogout,
}) => {
  const handleLogout = async () => {
    setRoleMenuOpen(false);
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      const supabase = getSupabase?.();
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error(err);
    }
    window.location.reload();
  };

  React.useEffect(() => {
    if (userProfile?.id && getSupabase) {
      try {
        const supabase = getSupabase();
        if (supabase) {
          supabase.from('profiles').select('console_handle, registered_workspaces').eq('id', userProfile.id).maybeSingle().then(({ data }: any) => {
            if (data?.console_handle || data?.registered_workspaces) {
              const freshHandle = data.console_handle || userProfile.console_handle;
              const freshWorkspaces = data.registered_workspaces || userProfile.registered_workspaces;
              if (freshHandle !== userProfile.console_handle || JSON.stringify(freshWorkspaces) !== JSON.stringify(userProfile.registered_workspaces)) {
                const updated = { ...userProfile, console_handle: freshHandle, registered_workspaces: freshWorkspaces };
                if (setUserProfile) setUserProfile(updated);
                localStorage.setItem('nexus_core_user_profile', JSON.stringify(updated));
              }
            }
          });
        }
      } catch (e) {
        console.error('Failed to fetch profile sync:', e);
      }
    }
  }, [userProfile?.id]);

  return (
    <div className="relative z-30 bg-[#030303]/90 backdrop-blur-md border-b border-zinc-900/85 flex flex-col">
      {/* Top Navbar */}
      <div className={`px-4 py-1.5 min-h-[66px] items-center justify-between relative z-40 ${isEmbedded ? 'hidden' : 'flex'}`}>
        <div className="flex items-center gap-3">
          <img
            src="https://cyjnpuneruonskfzpmqo.supabase.co/storage/v1/object/public/public-assets/Nexus%20Core%20Long%20Logo%20copy.png"
            alt="Nexus Core"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain cursor-pointer transition-transform hover:scale-105 origin-left"
            onClick={() => {
              const newCount = adminClickCount + 1;
              setAdminClickCount(newCount);
              if (adminPINRef.current) clearTimeout(adminPINRef.current);
              if (newCount >= 5) {
                setShowAdminPINModal(true);
                setAdminClickCount(0);
              } else {
                adminPINRef.current = setTimeout(() => setAdminClickCount(0), 2000);
              }
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors mr-1"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItems.length > 0 && (
              <span className="absolute top-1.5 right-1 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
          {!isEmbedded && (
            <div className="text-right mr-1">
              <p className={`text-[9px] font-mono font-bold uppercase tracking-wider leading-none mb-1 ${
                portalRole === 'fan_only' ? 'text-cyan-400' : 'text-[#9d4edf]'
              }`}>
                {portalRole === 'fan_only'
                  ? 'FAN ZONE'
                  : portalRole === 'band'
                  ? activeBand?.name?.toUpperCase() || 'ARTIST WORKSPACE'
                  : portalRole === 'creative'
                  ? 'CREATIVE PRO'
                  : portalRole === 'promoter'
                  ? 'PROMOTER PRO'
                  : portalRole === 'label'
                  ? 'RECORD LABEL'
                  : 'INDUSTRY PRO'}
              </p>
              <p className="text-sm font-black text-white leading-none">
                Hi {(profileFullLegalName || userProfile?.display_name || userProfile?.username || 'User').split(' ')[0]},
              </p>
            </div>
          )}

          <div className="relative z-[99999]">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`relative rounded-full overflow-hidden transition-all duration-300 p-0.5 border-2 ${
                portalRole === 'fan_only'
                  ? 'border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                  : 'border-[#6601BB] shadow-[0_0_15px_rgba(102,1,187,0.7)]'
              }`}
              title="Switch Workspace / Profile"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                {(() => {
                  const activeKey = portalRole || userProfile?.active_workspace || 'industry_pro';
                  const activeAvatar = (
                    activeKey === 'creative' ? (userProfile?.creative_avatar || userProfile?.avatar_url)
                    : activeKey === 'band' ? (activeBand?.logo_url || userProfile?.avatar_url)
                    : activeKey === 'promoter' ? (userProfile?.promoter_logo || userProfile?.avatar_url)
                    : activeKey === 'label' ? (userProfile?.label_avatar || userProfile?.avatar_url)
                    : (userProfile?.avatar_url || userProfile?.avatar || userProfile?.image)
                  ) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                  return (
                    <img
                      referrerPolicy="no-referrer"
                      src={activeAvatar}
                      alt={profileFullLegalName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  );
                })()}
              </div>
            </button>

            {/* Role Switcher Dropdown Menu */}
            <AnimatePresence>
              {roleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[99990] bg-black/60 backdrop-blur-[2px]" onClick={() => setRoleMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed top-16 right-4 sm:right-6 w-[310px] max-h-[85vh] overflow-y-auto bg-[#0d0d0f] border border-zinc-800/90 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.95)] p-3 z-[99999] text-left"
                  >
                    {/* Header */}
                    {(() => {
                      const activeKey = portalRole || userProfile?.active_workspace || 'industry_pro';
                      const activeAvatar = (
                        activeKey === 'creative' ? (userProfile?.creative_avatar || userProfile?.avatar_url)
                        : activeKey === 'band' ? (activeBand?.logo_url || userProfile?.avatar_url)
                        : activeKey === 'promoter' ? (userProfile?.promoter_logo || userProfile?.avatar_url)
                        : activeKey === 'label' ? (userProfile?.label_avatar || userProfile?.avatar_url)
                        : (userProfile?.avatar_url || userProfile?.avatar || userProfile?.image)
                      ) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                      const rawHandle = userProfile?.console_handle || userProfile?.username || userProfile?.handle || userProfile?.display_name?.toLowerCase().replace(/\s+/g, '_') || profileFullLegalName?.toLowerCase().replace(/\s+/g, '_') || 'user';
                      const userHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
                      return (
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-900/80">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full border-2 border-[#6601BB] p-0.5 shadow-[0_0_10px_rgba(102,1,187,0.5)] shrink-0">
                              <img
                                src={activeAvatar}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white tracking-tight truncate">{userHandle}</div>
                              <div className="text-[9px] text-zinc-500 font-black uppercase tracking-wider truncate">{profileFullLegalName || userProfile?.name || 'User Name'}</div>
                            </div>
                          </div>
                          <button onClick={() => setRoleMenuOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })()}

                    {/* View Profile Button */}
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        let detailPayload: any;

                        if (portalRole === 'band') {
                          detailPayload = {
                            id: activeBand?.id || userProfile?.id || null,
                            name: activeBand?.name || userProfile?.bandName || 'Artist',
                            band_name: activeBand?.name || userProfile?.bandName || 'Artist',
                            avatar: activeBand?.logo_url || activeBand?.logo || activeBand?.avatar_url || userProfile?.avatar_url || null,
                            avatar_url: activeBand?.logo_url || activeBand?.logo || activeBand?.avatar_url || userProfile?.avatar_url || null,
                            logo_url: activeBand?.logo_url || activeBand?.logo || null,
                            banner: activeBand?.cover_url || activeBand?.banner || userProfile?.banner_url || null,
                            banner_url: activeBand?.cover_url || activeBand?.banner || userProfile?.banner_url || null,
                            cover_url: activeBand?.cover_url || activeBand?.banner || null,
                            location: activeBand?.location || activeBand?.homebase || userProfile?.location || 'USA / Global',
                            role: 'Artist',
                            account_type: 'band',
                            type: 'band',
                            isBandProfile: true,
                            isPersonal: false,
                            isYou: true,
                            badges: activeBand?.badges || ['🎸 Artist'],
                            customBadges: activeBand?.badges || ['🎸 Artist'],
                            bio: activeBand?.bio || activeBand?.description || userProfile?.bio || `${activeBand?.name || 'Artist'} profile on Nexus.`,
                            genres: activeBand?.genres || (activeBand?.genre ? [activeBand?.genre] : ['Metal']),
                            genre: activeBand?.genre || 'Metal',
                            lineup: activeBand?.lineup || activeBand?.members || [],
                            musicCatalog: activeBand?.catalog || []
                          };
                        } else if (portalRole === 'label') {
                          detailPayload = {
                            id: userProfile?.id || null,
                            name: userProfile?.label_company_name || 'Record Label',
                            label_company_name: userProfile?.label_company_name || 'Record Label',
                            avatar: userProfile?.label_logo || userProfile?.avatar_url || null,
                            avatar_url: userProfile?.label_logo || userProfile?.avatar_url || null,
                            banner: userProfile?.label_banner || userProfile?.banner_url || null,
                            banner_url: userProfile?.label_banner || userProfile?.banner_url || null,
                            cover_url: userProfile?.label_banner || userProfile?.banner_url || null,
                            location: userProfile?.label_headquarters || userProfile?.location || 'USA / Global',
                            role: 'Label',
                            account_type: 'label',
                            type: 'label',
                            isPersonal: false,
                            isBandProfile: false,
                            isYou: true,
                            badges: ['💿 Record Label'],
                            bio: userProfile?.label_description || userProfile?.bio || 'Official record label account on Nexus.'
                          };
                        } else if (portalRole === 'promoter') {
                          detailPayload = {
                            id: userProfile?.id || null,
                            name: userProfile?.promoter_metadata?.brand_name || (userProfile as any)?.promoter_name || 'Promoter',
                            avatar: userProfile?.promoter_metadata?.logo || (userProfile as any)?.promoter_logo || userProfile?.avatar_url || null,
                            avatar_url: userProfile?.promoter_metadata?.logo || (userProfile as any)?.promoter_logo || userProfile?.avatar_url || null,
                            banner: (userProfile as any)?.promoter_cover_image || userProfile?.banner_url || null,
                            banner_url: (userProfile as any)?.promoter_cover_image || userProfile?.banner_url || null,
                            cover_url: (userProfile as any)?.promoter_cover_image || userProfile?.banner_url || null,
                            location: (userProfile as any)?.promoter_city ? `${(userProfile as any).promoter_city}, ${(userProfile as any).promoter_state}` : (userProfile?.location || 'USA / Global'),
                            role: 'Promoter',
                            account_type: 'promoter',
                            type: 'promoter',
                            isPersonal: false,
                            isBandProfile: false,
                            isYou: true,
                            badges: ['🎫 Promoter'],
                            bio: userProfile?.bio || 'Concert promoter and event organizer on Nexus.'
                          };
                        } else if (portalRole === 'creative') {
                          detailPayload = {
                            id: userProfile?.id || null,
                            name: userProfile?.creative_metadata?.business_name || userProfile?.creative_business_name || userProfile?.creative_name || 'Creative Pro',
                            legalName: profileFullLegalName || userProfile?.full_name || userProfile?.name,
                            handle: userProfile?.creative_handle || 'creative_pro',
                            console_handle: userProfile?.creative_handle || 'creative_pro',
                            avatar: userProfile?.creative_avatar || userProfile?.avatar_url || null,
                            avatar_url: userProfile?.creative_avatar || userProfile?.avatar_url || null,
                            banner: userProfile?.creative_banner || userProfile?.banner_url || null,
                            banner_url: userProfile?.creative_banner || userProfile?.banner_url || null,
                            cover_url: userProfile?.creative_banner || userProfile?.banner_url || null,
                            location: userProfile?.creative_metadata?.base_location || userProfile?.location || 'USA / Global',
                            role: 'Creative',
                            account_type: 'creative',
                            type: 'creative',
                            isPersonal: true,
                            isBandProfile: false,
                            isYou: true,
                            badges: ['🛠️ Creative Pro', '🎨 Designer'],
                            bio: userProfile?.bio || 'Professional creative specialist on the Nexus network.'
                          };
                        } else if (portalRole === 'fan_only') {
                          detailPayload = {
                            id: userProfile?.id || null,
                            name: profileFullLegalName || userProfile?.full_name || userProfile?.screen_name || userProfile?.name || 'Fan Listener',
                            legalName: userProfile?.full_name || profileFullLegalName || userProfile?.name,
                            handle: userProfile?.screen_name?.toLowerCase().replace(/\s+/g, '') || 'fan_core',
                            console_handle: userProfile?.screen_name?.toLowerCase().replace(/\s+/g, '') || 'fan_core',
                            avatar: userProfile?.avatar_url || null,
                            avatar_url: userProfile?.avatar_url || null,
                            banner: userProfile?.banner_url || null,
                            banner_url: userProfile?.banner_url || null,
                            cover_url: userProfile?.banner_url || null,
                            location: userProfile?.location || 'USA / Global',
                            role: 'Fan Listener',
                            account_type: 'fan_only',
                            type: 'user',
                            isPersonal: true,
                            isBandProfile: false,
                            isYou: true,
                            badges: ['🤘 Fan'],
                            bio: userProfile?.bio || 'Fan profile on the Nexus network.'
                          };
                        } else {
                          const handleVal = userProfile?.console_handle || userProfile?.username || userProfile?.handle || 'pro_user';
                          detailPayload = {
                            id: userProfile?.id || null,
                            name: profileFullLegalName || userProfile?.name || userProfile?.display_name || 'Industry Pro',
                            legalName: userProfile?.full_name || profileFullLegalName || userProfile?.name,
                            console_handle: handleVal,
                            handle: handleVal,
                            username: handleVal,
                            avatar: userProfile?.avatar_url || null,
                            avatar_url: userProfile?.avatar_url || null,
                            banner: userProfile?.banner_url || null,
                            banner_url: userProfile?.banner_url || null,
                            cover_url: userProfile?.banner_url || null,
                            location: userProfile?.location || 'USA / Global',
                            role: 'Industry Pro',
                            account_type: 'industry_pro',
                            type: 'user',
                            isPersonal: true,
                            isBandProfile: false,
                            isYou: true,
                            badges: userProfile?.badges || ['💼 Industry Pro'],
                            customBadges: userProfile?.customBadges || userProfile?.badges || [],
                            bio: userProfile?.bio || userProfile?.blurb || 'User profile on the Nexus network.'
                          };
                        }

                        window.dispatchEvent(new CustomEvent('openPublicProfile', { detail: detailPayload }));
                        triggerNotification?.("⚡ Opening public profile card...");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#3b0b6c] hover:bg-[#4c0d8a] text-white py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors mb-2 shadow-md shadow-purple-900/20 cursor-pointer"
                    >
                      <User className="w-3 h-3" strokeWidth={2.5} />
                      VIEW MY PROFILE
                    </button>

                    <div className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1 px-1">
                      SWITCH ACTIVE PORTAL
                    </div>

                    <div className="space-y-1 mb-2">
                      {/* INDUSTRY PRO */}
                      {(() => {
                        const isIndustry = portalRole !== 'fan_only' && portalRole !== 'band' && portalRole !== 'creative' && portalRole !== 'promoter' && portalRole !== 'label';
                        return (
                          <button
                            onClick={async () => {
                              setRoleMenuOpen(false);
                              const updatedProfile = { ...userProfile, active_workspace: 'industry_pro', account_type: 'industry pro' };
                              if (setUserProfile) setUserProfile(updatedProfile);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('nexus_core_user_profile', JSON.stringify(updatedProfile));
                                window.dispatchEvent(new CustomEvent('nexus_core_user_profile_updated', { detail: updatedProfile }));
                                window.dispatchEvent(new CustomEvent('nexus_navigate_tab', { detail: 'social' }));
                              }
                              const supabase = getSupabase?.();
                              if (supabase && userProfile?.id) {
                                await supabase.from('profiles').update({ active_workspace: 'industry_pro', account_type: 'industry pro' }).eq('id', userProfile.id);
                              }
                              triggerNotification?.('Switched to Industry Pro Workspace');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                              isIndustry
                                ? 'bg-[#291244] border border-[#6601BB] text-white shadow-md'
                                : 'hover:bg-zinc-900/80 text-zinc-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm">🎟️</span>
                              <div className="text-left min-w-0">
                                <div className={`text-[11px] font-bold uppercase tracking-wider ${isIndustry ? 'text-[#a268ff]' : 'text-zinc-300'}`}>INDUSTRY PRO</div>
                                <div className={`text-[9px] font-mono leading-none mt-0.5 ${isIndustry ? 'text-zinc-300' : 'text-zinc-500'}`}>{isIndustry ? 'Active Environment' : 'Switch Workspace'}</div>
                              </div>
                            </div>
                            {isIndustry && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#a268ff] shadow-[0_0_8px_rgba(162,104,255,0.8)] shrink-0" />
                            )}
                          </button>
                        );
                      })()}

                      {/* FAN ONLY */}
                      {(() => {
                        const isActive = portalRole === 'fan_only';
                        const registeredWorkspaces = userProfile?.registered_workspaces || [];
                        const allowedWorkspaces = userProfile?.allowed_workspaces || [];
                        const isIndustryPro = userProfile?.account_type === 'industry_pro' ||
                          ['band', 'promoter', 'creative', 'label'].includes(portalRole) ||
                          ['band', 'promoter', 'creative', 'label'].includes(userProfile?.account_type) ||
                          ['band', 'promoter', 'creative', 'label'].some(w => hasRegisteredWorkspace(userProfile, w));
                        const isLocked = isIndustryPro; 
                        return (
                          <button
                            disabled={isLocked && !isActive}
                            onClick={async () => {
                              if (isLocked && !isActive) {
                                triggerNotification?.('⚡ Downgrade not possible for Industry Pro accounts.');
                                return;
                              }
                              setRoleMenuOpen(false);
                              const updatedProfile = { ...userProfile, active_workspace: 'fan_only', account_type: 'fan' };
                              if (setUserProfile) setUserProfile(updatedProfile);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('nexus_core_user_profile', JSON.stringify(updatedProfile));
                                window.dispatchEvent(new CustomEvent('nexus_core_user_profile_updated', { detail: updatedProfile }));
                                window.dispatchEvent(new CustomEvent('nexus_navigate_tab', { detail: 'social' }));
                              }
                              const supabase = getSupabase?.();
                              if (supabase && userProfile?.id) {
                                await supabase.from('profiles').update({ active_workspace: 'fan_only', account_type: 'fan' }).eq('id', userProfile.id);
                              }
                              triggerNotification?.('Switched to Fan Zone');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                              isActive
                                ? 'bg-[#153444] border border-cyan-500 text-white shadow-md'
                                : isLocked
                                ? 'opacity-40 cursor-not-allowed bg-zinc-950/20 border border-zinc-900/40 text-zinc-650 select-none'
                                : 'hover:bg-zinc-900/80 text-zinc-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm ${!isActive ? 'grayscale opacity-50' : ''}`}>💙</span>
                              <div className="text-left min-w-0">
                                <div className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-cyan-400' : isLocked ? 'text-zinc-500' : 'text-zinc-400'}`}>FAN ONLY</div>
                                <div className={`text-[9px] font-mono leading-none mt-0.5 ${isActive ? 'text-cyan-300' : isLocked ? 'text-zinc-600' : 'text-zinc-500'}`}>{isActive ? 'Active Environment' : (isLocked ? 'downgrade not possible' : 'Switch Workspace')}</div>
                              </div>
                            </div>
                            {isActive ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] shrink-0" />
                            ) : isLocked ? (
                              <div className="text-[8px] font-bold text-zinc-700 tracking-widest uppercase shrink-0">LOCKED</div>
                            ) : null}
                          </button>
                        );
                      })()}

                      {/* BAND / ARTIST */}
                      {(() => {
                        const bandAllowed = hasRegisteredWorkspace(userProfile, 'band');
                        const isActive = portalRole === 'band';
                        return (
                          <button
                            onClick={async () => {
                              if (!bandAllowed) {
                                triggerNotification?.('Redirecting to Band Workspace Registration...');
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('nexus_target_register_workspace', 'BAND');
                                }
                                window.dispatchEvent(new CustomEvent('nexus_target_register_workspace', { detail: { target: 'band' } }));
                                setRoleMenuOpen(false);
                                return;
                              }
                              setRoleMenuOpen(false);
                              const updatedProfile = { ...userProfile, active_workspace: 'band', account_type: 'industry pro' };
                              if (setUserProfile) setUserProfile(updatedProfile);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('nexus_core_user_profile', JSON.stringify(updatedProfile));
                                window.dispatchEvent(new CustomEvent('nexus_core_user_profile_updated', { detail: updatedProfile }));
                                window.dispatchEvent(new CustomEvent('nexus_navigate', { detail: 'home-v2' }));
                                window.dispatchEvent(new CustomEvent('nexus_navigate_tab', { detail: 'home-v2' }));
                              }
                              const supabase = getSupabase?.();
                              if (supabase && userProfile?.id) {
                                await supabase.from('profiles').update({ active_workspace: 'band', account_type: 'industry pro' }).eq('id', userProfile.id);
                              }
                              triggerNotification?.('Switched to Band / Artist Workspace');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                              isActive
                                ? 'bg-[#291244] border border-[#6601BB] text-white shadow-md'
                                : !bandAllowed
                                ? 'bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-200'
                                : 'hover:bg-zinc-900/80 text-zinc-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm ${!isActive && !bandAllowed ? 'opacity-80' : ''}`}>🎸</span>
                              <div className="text-left min-w-0">
                                <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isActive ? 'text-[#a268ff]' : (bandAllowed ? 'text-zinc-300' : 'text-amber-300')}`}>
                                  BAND / ARTIST {!bandAllowed && <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />}
                                </div>
                                <div className={`text-[9px] font-mono leading-none mt-0.5 ${isActive ? 'text-zinc-300' : (!bandAllowed ? 'text-amber-400/80 font-semibold' : 'text-zinc-500')}`}>{isActive ? 'Active Environment' : (!bandAllowed ? 'LOCKED • Tap to Register' : 'Switch Workspace')}</div>
                              </div>
                            </div>
                            {isActive ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#a268ff] shadow-[0_0_8px_rgba(162,104,255,0.8)] shrink-0" />
                            ) : !bandAllowed && (
                              <div className="w-5 h-5 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0">
                                <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />
                              </div>
                            )}
                          </button>
                        );
                      })()}

                      {/* VENUE PROMOTER */}
                      {(() => {
                        const promoterAllowed = hasRegisteredWorkspace(userProfile, 'promoter');
                        const isActive = portalRole === 'promoter';
                        return (
                          <button
                            onClick={async () => {
                              if (!promoterAllowed) {
                                triggerNotification?.('Redirecting to Promoter Workspace Registration...');
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('nexus_target_register_workspace', 'PROMOTER');
                                }
                                window.dispatchEvent(new CustomEvent('nexus_target_register_workspace', { detail: { target: 'promoter' } }));
                                setRoleMenuOpen(false);
                                return;
                              }
                              setRoleMenuOpen(false);
                              const updatedProfile = { ...userProfile, active_workspace: 'promoter', account_type: 'industry pro' };
                              if (setUserProfile) setUserProfile(updatedProfile);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('nexus_core_user_profile', JSON.stringify(updatedProfile));
                                window.dispatchEvent(new CustomEvent('nexus_core_user_profile_updated', { detail: updatedProfile }));
                              }
                              const supabase = getSupabase?.();
                              if (supabase && userProfile?.id) {
                                await supabase.from('profiles').update({ active_workspace: 'promoter', account_type: 'industry pro' }).eq('id', userProfile.id);
                              }
                              triggerNotification?.('Switched to Venue Promoter Gateway');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                              isActive
                                ? 'bg-[#291244] border border-[#6601BB] text-white shadow-md'
                                : !promoterAllowed
                                ? 'bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-200'
                                : 'hover:bg-zinc-900/80 text-zinc-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm ${!isActive && !promoterAllowed ? 'opacity-80' : ''}`}>🏟️</span>
                              <div className="text-left min-w-0">
                                <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isActive ? 'text-[#a268ff]' : (promoterAllowed ? 'text-zinc-300' : 'text-amber-300')}`}>
                                  VENUE PROMOTER {!promoterAllowed && <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />}
                                </div>
                                <div className={`text-[9px] font-mono leading-none mt-0.5 ${isActive ? 'text-zinc-300' : (!promoterAllowed ? 'text-amber-400/80 font-semibold' : 'text-zinc-500')}`}>{isActive ? 'Active Environment' : (!promoterAllowed ? 'LOCKED • Tap to Register' : 'Switch Workspace')}</div>
                              </div>
                            </div>
                            {isActive ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#a268ff] shadow-[0_0_8px_rgba(162,104,255,0.8)] shrink-0" />
                            ) : !promoterAllowed && (
                              <div className="w-5 h-5 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0">
                                <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />
                              </div>
                            )}
                          </button>
                        );
                      })()}

                      {/* CREATIVE HUB */}
                      {(() => {
                        const creativeAllowed = hasRegisteredWorkspace(userProfile, 'creative');
                        const isActive = portalRole === 'creative';
                        return (
                          <button
                            onClick={async () => {
                              if (!creativeAllowed) {
                                triggerNotification?.('Redirecting to Creative Workspace Registration...');
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('nexus_target_register_workspace', 'CREATIVE');
                                }
                                window.dispatchEvent(new CustomEvent('nexus_target_register_workspace', { detail: { target: 'creative' } }));
                                setRoleMenuOpen(false);
                                return;
                              }
                              setRoleMenuOpen(false);
                              const registered = normalizeRegisteredWorkspaces(userProfile?.registered_workspaces, ['creative']);
                              const updatedProfile = { ...userProfile, active_workspace: 'creative', account_type: 'creative', registered_workspaces: registered };
                              if (setUserProfile) setUserProfile(updatedProfile);
                              if (setActiveTab) setActiveTab('creative');
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('nexus_core_user_profile', JSON.stringify(updatedProfile));
                                window.dispatchEvent(new CustomEvent('nexus_core_user_profile_updated', { detail: updatedProfile }));
                              }
                              const supabase = getSupabase?.();
                              if (supabase && userProfile?.id) {
                                await supabase.from('profiles').update({ active_workspace: 'creative', account_type: 'creative' }).eq('id', userProfile.id);
                              }
                              triggerNotification?.('Switched to Creative Hub');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                              isActive
                                ? 'bg-[#291244] border border-[#6601BB] text-white shadow-md'
                                : !creativeAllowed
                                ? 'bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-200'
                                : 'hover:bg-zinc-900/80 text-zinc-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm ${!isActive && !creativeAllowed ? 'opacity-80' : ''}`}>🛠️</span>
                              <div className="text-left min-w-0">
                                <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isActive ? 'text-[#a268ff]' : (creativeAllowed ? 'text-zinc-300' : 'text-amber-300')}`}>
                                  CREATIVE HUB {!creativeAllowed && <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />}
                                </div>
                                <div className={`text-[9px] font-mono leading-none mt-0.5 ${isActive ? 'text-zinc-300' : (!creativeAllowed ? 'text-amber-400/80 font-semibold' : 'text-zinc-500')}`}>{isActive ? 'Active Environment' : (!creativeAllowed ? 'LOCKED • Tap to Register' : 'Switch Workspace')}</div>
                              </div>
                            </div>
                            {isActive ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#a268ff] shadow-[0_0_8px_rgba(162,104,255,0.8)] shrink-0" />
                            ) : !creativeAllowed && (
                              <div className="w-5 h-5 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0">
                                <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />
                              </div>
                            )}
                          </button>
                        );
                      })()}

                      {/* RECORD LABEL */}
                      {(() => {
                        const labelAllowed = hasRegisteredWorkspace(userProfile, 'label');
                        const isActive = portalRole === 'label';
                        return (
                          <button
                            onClick={async () => {
                              if (!labelAllowed) {
                                triggerNotification?.('Redirecting to Label Workspace Registration...');
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('nexus_target_register_workspace', 'LABEL');
                                }
                                window.dispatchEvent(new CustomEvent('nexus_target_register_workspace', { detail: { target: 'label' } }));
                                setRoleMenuOpen(false);
                                return;
                              }
                              setRoleMenuOpen(false);
                              const updatedProfile = { ...userProfile, active_workspace: 'label', account_type: 'industry pro' };
                              if (setUserProfile) setUserProfile(updatedProfile);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('nexus_core_user_profile', JSON.stringify(updatedProfile));
                                window.dispatchEvent(new CustomEvent('nexus_core_user_profile_updated', { detail: updatedProfile }));
                              }
                              const supabase = getSupabase?.();
                              if (supabase && userProfile?.id) {
                                await supabase.from('profiles').update({ active_workspace: 'label', account_type: 'industry pro' }).eq('id', userProfile.id);
                              }
                              triggerNotification?.('Switched to Record Label Console');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                              isActive
                                ? 'bg-[#291244] border border-[#6601BB] text-white shadow-md'
                                : !labelAllowed
                                ? 'bg-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-200'
                                : 'hover:bg-zinc-900/80 text-zinc-400 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-sm ${!isActive && !labelAllowed ? 'opacity-80' : ''}`}>💿</span>
                              <div className="text-left min-w-0">
                                <div className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isActive ? 'text-[#a268ff]' : (labelAllowed ? 'text-zinc-300' : 'text-amber-300')}`}>
                                  RECORD LABEL {!labelAllowed && <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />}
                                </div>
                                <div className={`text-[9px] font-mono leading-none mt-0.5 ${isActive ? 'text-zinc-300' : (!labelAllowed ? 'text-amber-400/80 font-semibold' : 'text-zinc-500')}`}>{isActive ? 'Active Environment' : (!labelAllowed ? 'LOCKED • Tap to Register' : 'Switch Workspace')}</div>
                              </div>
                            </div>
                            {isActive ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#a268ff] shadow-[0_0_8px_rgba(162,104,255,0.8)] shrink-0" />
                            ) : !labelAllowed && (
                              <div className="w-5 h-5 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center shrink-0">
                                <Lock className="w-3 h-3 text-amber-400" strokeWidth={2.5} />
                              </div>
                            )}
                          </button>
                        );
                      })()}
                    </div>

                    <div className="pt-2 border-t border-zinc-900/80 space-y-0.5">
                      <button 
                        onClick={() => {
                          setRoleMenuOpen(false);
                          let detailPayload: any;

                          if (portalRole === 'band') {
                            detailPayload = {
                              id: activeBand?.id || userProfile?.id || null,
                              name: activeBand?.name || userProfile?.bandName || 'Artist',
                              band_name: activeBand?.name || userProfile?.bandName || 'Artist',
                              avatar: activeBand?.logo_url || activeBand?.logo || activeBand?.avatar_url || userProfile?.avatar_url || null,
                              avatar_url: activeBand?.logo_url || activeBand?.logo || activeBand?.avatar_url || userProfile?.avatar_url || null,
                              logo_url: activeBand?.logo_url || activeBand?.logo || null,
                              banner: activeBand?.cover_url || activeBand?.banner || userProfile?.banner_url || null,
                              banner_url: activeBand?.cover_url || activeBand?.banner || userProfile?.banner_url || null,
                              cover_url: activeBand?.cover_url || activeBand?.banner || null,
                              location: activeBand?.location || activeBand?.homebase || userProfile?.location || 'USA / Global',
                              role: 'Artist',
                              account_type: 'band',
                              type: 'band',
                              isBandProfile: true,
                              isPersonal: false,
                              isYou: true,
                              badges: activeBand?.badges || ['🎸 Artist'],
                              customBadges: activeBand?.badges || ['🎸 Artist'],
                              bio: activeBand?.bio || activeBand?.description || userProfile?.bio || `${activeBand?.name || 'Artist'} profile on Nexus.`,
                              genres: activeBand?.genres || (activeBand?.genre ? [activeBand?.genre] : ['Metal']),
                              genre: activeBand?.genre || 'Metal',
                              lineup: activeBand?.lineup || activeBand?.members || [],
                              musicCatalog: activeBand?.catalog || []
                            };
                          } else if (portalRole === 'label') {
                            detailPayload = {
                              id: userProfile?.id || null,
                              name: userProfile?.label_company_name || 'Record Label',
                              label_company_name: userProfile?.label_company_name || 'Record Label',
                              avatar: userProfile?.label_logo || userProfile?.avatar_url || null,
                              avatar_url: userProfile?.label_logo || userProfile?.avatar_url || null,
                              banner: userProfile?.label_banner || userProfile?.banner_url || null,
                              banner_url: userProfile?.label_banner || userProfile?.banner_url || null,
                              cover_url: userProfile?.label_banner || userProfile?.banner_url || null,
                              location: userProfile?.label_headquarters || userProfile?.location || 'USA / Global',
                              role: 'Label',
                              account_type: 'label',
                              type: 'label',
                              isPersonal: false,
                              isBandProfile: false,
                              isYou: true,
                              badges: ['💿 Record Label'],
                              bio: userProfile?.label_description || userProfile?.bio || 'Official record label account on Nexus.'
                            };
                          } else if (portalRole === 'promoter') {
                            detailPayload = {
                              id: userProfile?.id || null,
                              name: userProfile?.promoter_metadata?.brand_name || (userProfile as any)?.promoter_name || 'Promoter',
                              avatar: userProfile?.promoter_metadata?.logo || (userProfile as any)?.promoter_logo || userProfile?.avatar_url || null,
                              avatar_url: userProfile?.promoter_metadata?.logo || (userProfile as any)?.promoter_logo || userProfile?.avatar_url || null,
                              banner: (userProfile as any)?.promoter_cover_image || userProfile?.banner_url || null,
                              banner_url: (userProfile as any)?.promoter_cover_image || userProfile?.banner_url || null,
                              cover_url: (userProfile as any)?.promoter_cover_image || userProfile?.banner_url || null,
                              location: (userProfile as any)?.promoter_city ? `${(userProfile as any).promoter_city}, ${(userProfile as any).promoter_state}` : (userProfile?.location || 'USA / Global'),
                              role: 'Promoter',
                              account_type: 'promoter',
                              type: 'promoter',
                              isPersonal: false,
                              isBandProfile: false,
                              isYou: true,
                              badges: ['🎫 Promoter'],
                              bio: userProfile?.bio || 'Concert promoter and event organizer on Nexus.'
                            };
                          } else if (portalRole === 'creative') {
                            detailPayload = {
                              id: userProfile?.id || null,
                              name: userProfile?.creative_metadata?.business_name || userProfile?.creative_business_name || userProfile?.creative_name || 'Creative Pro',
                              legalName: profileFullLegalName || userProfile?.full_name || userProfile?.name,
                              handle: userProfile?.creative_handle || 'creative_pro',
                              console_handle: userProfile?.creative_handle || 'creative_pro',
                              avatar: userProfile?.creative_avatar || userProfile?.avatar_url || null,
                              avatar_url: userProfile?.creative_avatar || userProfile?.avatar_url || null,
                              banner: userProfile?.creative_banner || userProfile?.banner_url || null,
                              banner_url: userProfile?.creative_banner || userProfile?.banner_url || null,
                              cover_url: userProfile?.creative_banner || userProfile?.banner_url || null,
                              location: userProfile?.creative_metadata?.base_location || userProfile?.location || 'USA / Global',
                              role: 'Creative',
                              account_type: 'creative',
                              type: 'creative',
                              isPersonal: true,
                              isBandProfile: false,
                              isYou: true,
                              badges: ['🛠️ Creative Pro', '🎨 Designer'],
                              bio: userProfile?.bio || 'Professional creative specialist on the Nexus network.'
                            };
                          } else if (portalRole === 'fan_only') {
                            detailPayload = {
                              id: userProfile?.id || null,
                              name: profileFullLegalName || userProfile?.full_name || userProfile?.screen_name || userProfile?.name || 'Fan Listener',
                              legalName: userProfile?.full_name || profileFullLegalName || userProfile?.name,
                              handle: userProfile?.screen_name?.toLowerCase().replace(/\s+/g, '') || 'fan_core',
                              console_handle: userProfile?.screen_name?.toLowerCase().replace(/\s+/g, '') || 'fan_core',
                              avatar: userProfile?.avatar_url || null,
                              avatar_url: userProfile?.avatar_url || null,
                              banner: userProfile?.banner_url || null,
                              banner_url: userProfile?.banner_url || null,
                              cover_url: userProfile?.banner_url || null,
                              location: userProfile?.location || 'USA / Global',
                              role: 'Fan Listener',
                              account_type: 'fan_only',
                              type: 'user',
                              isPersonal: true,
                              isBandProfile: false,
                              isYou: true,
                              badges: ['🤘 Fan'],
                              bio: userProfile?.bio || 'Fan profile on the Nexus network.'
                            };
                          } else {
                            const handleVal = userProfile?.console_handle || userProfile?.username || userProfile?.handle || 'pro_user';
                            detailPayload = {
                              id: userProfile?.id || null,
                              name: profileFullLegalName || userProfile?.name || userProfile?.display_name || 'Industry Pro',
                              legalName: userProfile?.full_name || profileFullLegalName || userProfile?.name,
                              console_handle: handleVal,
                              handle: handleVal,
                              username: handleVal,
                              avatar: userProfile?.avatar_url || null,
                              avatar_url: userProfile?.avatar_url || null,
                              banner: userProfile?.banner_url || null,
                              banner_url: userProfile?.banner_url || null,
                              cover_url: userProfile?.banner_url || null,
                              location: userProfile?.location || 'USA / Global',
                              role: 'Industry Pro',
                              account_type: 'industry_pro',
                              type: 'user',
                              isPersonal: true,
                              isBandProfile: false,
                              isYou: true,
                              badges: userProfile?.badges || ['💼 Industry Pro'],
                              customBadges: userProfile?.customBadges || userProfile?.badges || [],
                              bio: userProfile?.bio || userProfile?.blurb || 'User profile on the Nexus network.'
                            };
                          }

                          window.dispatchEvent(new CustomEvent('openPublicProfile', { detail: detailPayload }));
                          triggerNotification?.("⚡ Opening your public profile...");
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-cyan-950/30"
                      >
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        View My Profile
                      </button>
                      <button 
                        onClick={() => {
                          setRoleMenuOpen(false);
                          setLeftDrawerOpen(true);
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-zinc-900/80"
                      >
                        <Settings className="w-3.5 h-3.5 text-zinc-400" />
                        Profile Settings & Preferences
                      </button>
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 text-xs font-bold text-[#a268ff] hover:text-[#b78aff] transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-[#6601BB]/10"
                      >
                        <X className="w-3.5 h-3.5" />
                        Log Out from Terminal
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Primary Global Navigation Bar / Sub-Navigation Bar & Universal Search (Hidden in Clips tab for immersive fullscreen video, and in Messages/Inbox tab) */}
      {activeTab !== 'reels' && activeTab !== 'messages' && (
        <div className="flex flex-col border-t border-zinc-900/80 bg-[#0c0e12]">
          <div className="flex items-center justify-around px-1 py-[3px] relative w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'feed', label: 'Feed', icon: Home, isTab: true },
              { id: 'shop', label: 'Shop', icon: ShoppingBag, isTab: true },
              { id: 'forum', label: 'Forum', icon: Users, isTab: true },
              { id: 'photopit', label: 'Photo Pit', icon: Camera, isTab: true },
              { id: 'reels', label: 'Clips', icon: Video, isTab: true },
              { id: 'messages', label: 'Inbox', icon: MessageSquare, isTab: true },
              { id: 'notices', label: 'Notices', icon: Bell, badge: true, isTab: false }
            ].map((item) => {
              const isActive = item.isTab ? activeTab === item.id : false;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isTab) {
                      setActiveTab(item.id);
                    } else {
                      if (item.id === 'notices') setRightDrawerOpen(true);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center gap-1 px-1 py-1 min-w-[48px] transition-all group`}
                >
                  {/* Icon */}
                  <div className={`relative flex items-center justify-center transition-colors ${
                    isActive 
                      ? portalRole === 'fan_only' ? 'text-cyan-400' : 'text-[#9d4edf]' 
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}>
                    <item.icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                    {item.badge && unreadNotifsCount > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg ${
                        portalRole === 'fan_only' ? 'bg-cyan-500' : 'bg-[#6601BB]'
                      }`}>
                        {unreadNotifsCount}
                      </span>
                    )}
                    {item.id === 'notices' && unreadNotifsCount > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full animate-ping ${
                        portalRole === 'fan_only' ? 'bg-cyan-500' : 'bg-[#6601BB]'
                      }`} />
                    )}
                  </div>
                  {/* Label */}
                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] transition-colors ${
                    isActive 
                      ? portalRole === 'fan_only' ? 'text-cyan-400' : 'text-[#9d4edf]'
                      : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}>
                    {item.label}
                  </span>
                  {/* Active Indicator Line */}
                  {isActive && (
                    <motion.div
                      layoutId="socialNavIndicator"
                      className={`absolute -bottom-[3px] left-1 right-1 h-[2px] rounded-t-full ${
                        portalRole === 'fan_only' ? 'bg-cyan-400 shadow-[0_-2px_8px_rgba(34,211,238,0.5)]' : 'bg-[#6601BB] shadow-[0_-2px_8px_rgba(102,1,187,0.8)]'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Universal Live Search Bar (Hidden in Photo Pit to keep UI focused) */}
          {activeTab !== 'photopit' && activeTab !== 'gallery' && (
            <div className="w-full p-2 pb-3.5 border-t border-zinc-900 bg-[#060607] relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Bands, Venues, Creatives, Labels and People"
                  className="w-full bg-zinc-900/60 border border-transparent rounded-full pl-9 pr-8 py-2 text-[12px] text-white placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-zinc-700 transition-all font-sans truncate"
                />
                {globalSearchQuery && (
                  <button
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-2 text-zinc-500 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Dropdown Results */}
              {globalSearchQuery.trim().length > 0 && (
                <div className="absolute right-0 left-0 top-full mt-2 mx-2 bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-[9999] overflow-hidden max-h-96 overflow-y-auto no-scrollbar">
                  <div className="px-3 py-1.5 border-b border-zinc-900 flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                      Live Search Results
                    </span>
                    <span className="text-[9px] font-mono text-zinc-600">
                      Matches query: "{globalSearchQuery}"
                    </span>
                  </div>

                  {(() => {
                    const q = globalSearchQuery.toLowerCase();
                    const combined = [...(searchResults || []), ...(allProfiles || []), ...(discoverProfiles || [])];
                    const seen = new Set<string>();
                    const unique = combined.filter(p => {
                      if (!p) return false;
                      const key = String(p.id || p.band_id || p.band_name || p.username || p.name);
                      if (!key || seen.has(key)) return false;
                      seen.add(key);
                      return true;
                    });

                    const matchingProfiles = unique.filter(p => {
                      const nameFields = [
                        p.full_name,
                        p.username,
                        p.name,
                        p.console_handle,
                        p.band_name,
                        p.business_name,
                        p.agency_name,
                        p.label_name
                      ].filter(Boolean).map(f => String(f).toLowerCase());

                      const nameCombined = nameFields.join(' ');
                      
                      // If searching for Miguel, exclude "Vortex Graphics" creative/band profile.
                      const isSearchingForMiguel = q.includes('miguel') || q.includes('goregrinder') || q.includes('goregrindsickness');
                      const isVortexProfile = nameCombined.includes('vortex graphics') || nameCombined.includes('vortex graphic');
                      if (isSearchingForMiguel && isVortexProfile) {
                        return false;
                      }

                      const role = (p.role || p.portalRole || p.type || '').toLowerCase();
                      const genre = (p.genre || p.genres || '').toString().toLowerCase();
                      const location = (p.homebase || p.city || p.location || '').toLowerCase();
                      const bio = (p.bio || p.description || '').toLowerCase();

                      const matchesName = nameFields.some(f => f.includes(q));
                      return matchesName || role.includes(q) || genre.includes(q) || location.includes(q) || bio.includes(q);
                    });

                    if (matchingProfiles.length === 0) {
                      return (
                        <div className="p-4 text-center">
                          <p className="text-xs text-zinc-500 font-medium">No matching profiles, registered bands, or entities found.</p>
                        </div>
                      );
                    }

                    const grouped: Record<string, any[]> = {};
                    matchingProfiles.forEach(p => {
                      const isIndustryPro = p.account_type === 'industry_pro' || p.account_type === 'industry pro';
                      const isBand = !isIndustryPro && (p.isBandProfile || p.type === 'band' || p.role === 'band' || p.role === 'artist_band' || Boolean(p.band_name));
                      const isLabel = !isIndustryPro && (p.role === 'label' || Boolean(p.label_name));
                      const isPromoter = !isIndustryPro && (p.role === 'promoter' || p.role === 'venue' || Boolean(p.agency_name));
                      const isCreative = !isIndustryPro && (p.role === 'creative' || Boolean(p.business_name));

                      const cat = isIndustryPro ? 'Community & Scene' : isBand ? 'Bands & Artists' : isLabel ? 'Record Labels' : isPromoter ? 'Promoters & Venues' : isCreative ? 'Creative Media' : 'Community & Scene';
                      if (!grouped[cat]) grouped[cat] = [];
                      grouped[cat].push(p);
                    });

                    return Object.entries(grouped).map(([catName, items]) => (
                      <div key={catName} className="mb-2 last:mb-0">
                        <div className="px-2 py-1 text-[9px] font-black uppercase text-zinc-500 tracking-wider font-mono">
                          {catName}
                        </div>
                        <div className="space-y-1 mt-1">
                          {items.map(item => {
                            const displayName = item.full_name || item.band_name || item.business_name || item.agency_name || item.label_name || item.username || item.name || item.console_handle || 'Unknown Entity';
                            const displayAvatar = item.avatar_url || item.avatar || item.logo_url || item.band_logo || item.creative_avatar || item.promoter_logo || item.label_avatar;
                            const subRole = item.genre || item.homebase || item.portalRole || item.role || (catName === 'Bands & Artists' ? 'Registered Band' : 'Scene Member');

                            const uniqueKey = `search-item-${item.id || ''}-${item.band_id || ''}-${item.role || item.portalRole || item.type || ''}-${displayName}-${subRole}`;

                            return (
                              <div
                                key={uniqueKey}
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('openPublicProfile', { detail: { profile: item } }));
                                  setGlobalSearchQuery('');
                                }}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-white overflow-hidden shrink-0 border border-zinc-800">
                                    {displayAvatar ? (
                                      <img referrerPolicy="no-referrer" src={displayAvatar} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                      displayName.slice(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors truncate leading-tight">
                                      {displayName}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 truncate leading-tight">
                                      {subRole}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGlobalSearchFollowToggle(item.id || item.band_id, displayName);
                                  }}
                                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider font-mono rounded-full border transition-all shrink-0 ${
                                    item.followed
                                      ? 'bg-purple-950/50 text-purple-400 border-purple-500/40 hover:bg-purple-900/50'
                                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                                  }`}
                                >
                                  {item.followed ? 'Followed' : '+ Follow'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
