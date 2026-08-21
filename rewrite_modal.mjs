import fs from 'fs';

const origContent = fs.readFileSync('src/components/social/modals/PublicProfileModal.tsx', 'utf8');

// extract ProfileCardProps and ProfileCard
const profileCardPropsMatch = origContent.match(/export interface ProfileCardProps \{[\s\S]*?\}/);
const profileCardMatch = origContent.match(/export const ProfileCard: React\.FC<ProfileCardProps> = \(\{[\s\S]*?\}\);/);

// extract PublicProfileModalProps
const modalPropsMatch = origContent.match(/interface PublicProfileModalProps \{[\s\S]*?\n\}/);

let newContent = `import React from 'react';
import { BandProfileCard } from '../../profile/BandProfileCard';
import { ArtistProfileCard } from '../../profile/ArtistProfileCard';
import { LabelProfileCard } from '../../profile/LabelProfileCard';
import { PromoterProfileCard } from '../../profile/PromoterProfileCard';
import { CheckCircle, MapPin } from 'lucide-react';
import { SonicFootprint } from '../../profile/SonicFootprint';

// Keep ListenerMetric exports
export type { ListenerMetric } from '../../profile/SonicFootprint';
export { calculateListenerMetrics } from '../../profile/SonicFootprint';

${profileCardPropsMatch[0]}

${profileCardMatch[0]}

export ${modalPropsMatch[0]}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = (props) => {
  const baseTarget = props.selectedUserProfile || props.targetProfile;
  if (!baseTarget) return null;
  
  const targetRole = (baseTarget?.role || baseTarget?.portalRole || '').toLowerCase();
  
  const isExplicitPersonal = !!(
    baseTarget?.isPersonal ||
    targetRole === 'fan' ||
    targetRole === 'industry pro' ||
    targetRole === 'member' ||
    targetRole === 'creative' ||
    targetRole === 'promoter' ||
    targetRole === 'label'
  );
  
  const isArtistOrBand = !isExplicitPersonal && !!(
    baseTarget?.isBandProfile ||
    baseTarget?.type === 'band' ||
    targetRole === 'artist' ||
    targetRole === 'band'
  );

  if (isArtistOrBand) {
    return <BandProfileCard {...props} />;
  }
  if (targetRole.includes('label')) {
    return <LabelProfileCard {...props} />;
  }
  if (targetRole.includes('promoter')) {
    return <PromoterProfileCard {...props} />;
  }
  
  return <ArtistProfileCard {...props} />;
};

export default PublicProfileModal;
`;

fs.writeFileSync('src/components/social/modals/PublicProfileModal.tsx', newContent);
console.log("PublicProfileModal.tsx rewritten.");
