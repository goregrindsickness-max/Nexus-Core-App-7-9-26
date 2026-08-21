import React from 'react';
import { ProfileCard as BandProfileCard } from '../../portals/Band/ProfileCard';
import { ProfileCard as CreativeProfileCard } from '../../portals/Creative/ProfileCard';
import { ProfileCard as LabelProfileCard } from '../../portals/Label/ProfileCard';
import { ProfileCard as PromoterProfileCard } from '../../portals/Promoter/ProfileCard';
import { CheckCircle, MapPin } from 'lucide-react';
import { SonicFootprint } from '../../profile/SonicFootprint';

// Keep ListenerMetric exports
export type { ListenerMetric } from '../../profile/SonicFootprint';
export { calculateListenerMetrics } from '../../profile/SonicFootprint';

export interface ProfileCardProps {
  profile?: any;
  onActionClick?: (actionLabel: string, metricId: string) => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onActionClick, className = '' }) => {
  const name = profile?.name || profile?.full_name || 'Underground Listener';
  const role = profile?.role || profile?.account_type || 'Fan Listener';
  const location = profile?.location || profile?.homebase || 'Global Scene';
  const avatar = profile?.avatar_url || profile?.avatar || name.slice(0, 2).toUpperCase();

  const r = (profile?.role || profile?.account_type || profile?.portalRole || profile?.type || '').toLowerCase();
  const isWorkspace = profile?.isBandProfile === true ||
    profile?.isCreativeProfile === true ||
    profile?.isLabelProfile === true ||
    profile?.isPromoterProfile === true ||
    r.includes('artist') ||
    r.includes('band') ||
    r.includes('creative') ||
    r.includes('designer') ||
    r.includes('photographer') ||
    r.includes('videographer') ||
    r.includes('label') ||
    r.includes('promoter') ||
    r.includes('venue');

  return (
    <div className={`bg-zinc-950 border border-zinc-900 rounded-3xl p-4 sm:p-5 space-y-5 shadow-2xl ${className}`}>
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-rose-600 p-0.5 shadow-lg shrink-0 overflow-hidden">
          {typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:')) ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover rounded-[14px]" />
          ) : (
            <div className="w-full h-full bg-zinc-900 rounded-[14px] flex items-center justify-center font-mono font-black text-white text-lg">
              {avatar}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-base font-black text-white tracking-tight font-display truncate">{name}</h2>
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-zinc-400 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold text-[10px] uppercase">
              {role}
            </span>
            <span className="flex items-center gap-1 text-zinc-400 text-[11px]">
              <MapPin className="w-3 h-3 text-rose-400" />
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* Sonic Footprint & Listener Metrics - ONLY on user accounts, not on any workspace profiles */}
      {!isWorkspace && (
        <SonicFootprint profile={profile} onActionClick={onActionClick} />
      )}
    </div>
  );
};



export interface PublicProfileModalProps {
  selectedUserProfile: any;
  setSelectedUserProfile: React.Dispatch<React.SetStateAction<any>>;
  onBackProfile?: () => void;
  profileHistory?: any[];
  targetProfile: any;
  userProfile: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
  portalRole?: string;
  profileActiveTab: string;
  setProfileActiveTab: (tab: string) => void;
  triggerPictureViewer?: (data: any) => void;
  triggerNotification?: (msg: string) => void;
  allProfiles?: any[];
  handleFollowProfile?: (name: any, forceAction?: 'follow' | 'unfollow') => void;
  setViewingFollowersOrFollowing?: (val: 'followers' | 'following' | null) => void;
  openFloatingChat?: (id: string, obj: any) => void;
  bandJoinRequests?: any[];
  setBandJoinRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  setLeftDrawerOpen?: (val: boolean) => void;
  setDrawerCurrentView?: (view: string) => void;
  openCheckout?: (type: string, item: any) => void;
  setShowReportModal?: (val: boolean) => void;
  setShowSubmitEpkModal?: (val: boolean) => void;
  setShowAddItemModal?: (val: boolean) => void;
  setShopBrandFilter?: (brand: string) => void;
  setSecondaryUserProfile?: (user: any) => void;
  setActiveTab?: (tab: any) => void;
  profileBlurb: string;
  setProfileBlurb: (val: string) => void;
  saveProfileData: (notify?: boolean) => void;
  labelRosterTicker?: string;
  profilePrimaryGenres?: string[];
  profileMicroGenres?: string[];
  profileGenres?: string[];
  profileTopSongArtist: string;
  setProfileTopSongArtist: (val: string) => void;
  profileTopSongTitle: string;
  setProfileTopSongTitle: (val: string) => void;
  setProfileFavoriteSong: (val: string) => void;
  setProfileTopSongUrl: (val: string) => void;
  rosterExpanded: boolean;
  setRosterExpanded: (val: boolean) => void;
  collectionTab: string;
  setCollectionTab: (tab: any) => void;
  myCollections: any[];
  collPlayerActiveId: string;
  setCollPlayerActiveId: (id: string) => void;
  collPlayerActiveTrackId: string;
  setCollPlayerActiveTrackId: (id: string) => void;
  collPlayerIsPlaying: boolean;
  setCollPlayerIsPlaying: (val: boolean) => void;
  setSelectedGalleryItem?: (item: any) => void;
  selectedLabelBand: string;
  setSelectedLabelBand: (band: string) => void;
  profileActivePlaybackTrackId: string | null;
  setProfileActivePlaybackTrackId: (id: string | null) => void;
  profileIsPlaying: boolean;
  setProfileIsPlaying: (val: boolean) => void;
  profilePlaybackProgress: number;
  setProfilePlaybackProgress: (val: number) => void;
  getProfileForUser: (userParam: any) => any;
  supabase?: any;
  liveProfileStats?: any;
  setLiveProfileStats?: React.Dispatch<React.SetStateAction<any>>;
  feed?: any[];
}



export const PublicProfileModal: React.FC<PublicProfileModalProps> = (props) => {
  const baseTarget = props.selectedUserProfile || props.targetProfile;
  if (!baseTarget) return null;
  
  const targetRole = (baseTarget?.role || baseTarget?.portalRole || baseTarget?.account_type || baseTarget?.type || '').toLowerCase();
  const isPersonal = baseTarget?.isIndustryProPersonal === true;

  if (baseTarget?.type === 'creative' || baseTarget?.account_type === 'creative' || baseTarget?.isCreativeProfile === true || targetRole === 'creative' || targetRole.includes('creative') || targetRole.includes('designer') || targetRole.includes('photographer') || targetRole.includes('videographer')) {
    return <CreativeProfileCard {...props} />;
  }

  if (baseTarget?.type === 'label' || baseTarget?.account_type === 'label' || baseTarget?.isLabelProfile === true || targetRole === 'label' || targetRole.includes('label')) {
    return <LabelProfileCard {...props} />;
  }

  if (baseTarget?.type === 'promoter' || baseTarget?.account_type === 'promoter' || baseTarget?.isPromoterProfile === true || targetRole === 'promoter' || targetRole.includes('promoter') || targetRole.includes('venue')) {
    return <PromoterProfileCard {...props} />;
  }

  const isArtistOrBand = !isPersonal && !!(
    baseTarget?.isBandProfile === true ||
    baseTarget?.isBand === true ||
    baseTarget?.type === 'band' ||
    targetRole === 'band' ||
    (targetRole.includes('band') && !targetRole.includes('fan')) ||
    (targetRole.includes('artist') && !targetRole.includes('fan'))
  );

  if (isArtistOrBand) {
    return <BandProfileCard {...props} />;
  }
  
  // Default (Fan Only and Industry Pro Personal profile cards)
  return <BandProfileCard {...props} />;
};

export default PublicProfileModal;
