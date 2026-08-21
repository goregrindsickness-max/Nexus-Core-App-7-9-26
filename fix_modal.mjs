import fs from 'fs';

const origContent = fs.readFileSync('src/components/profile/BandProfileCard.tsx', 'utf8');

// I will just use string splits because regex is dangerous here.
const propsStart = origContent.indexOf('interface PublicProfileModalProps {');
const propsEnd = origContent.indexOf('export const BandProfileCard: React.FC<PublicProfileModalProps> =');
const propsText = origContent.substring(propsStart, propsEnd);

const beforeProps = origContent.substring(0, propsStart);
const profileCardPropsStart = beforeProps.indexOf('export interface ProfileCardProps');
const sonicFootprintStart = beforeProps.indexOf('import { SonicFootprint');

const topImports = beforeProps.substring(0, sonicFootprintStart);
const theRest = beforeProps.substring(profileCardPropsStart, propsStart);

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

${theRest}
export ${propsText}

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
console.log("PublicProfileModal.tsx rewritten properly.");
