const fs = require('fs');
let file = fs.readFileSync('src/components/PromoterDashboardViewV2.tsx', 'utf8');

file = file.replace(`interface PromoterDashboardViewV2Props {
  userProfile: UserProfile;
import PromoterSettingsTab from './PromoterSettingsTab';
import PromoterAlliancesView from './PromoterAlliancesView';
import PromoterWorkspaceProtocols from './PromoterWorkspaceProtocols';`, `import PromoterSettingsTab from './PromoterSettingsTab';
import PromoterAlliancesView from './PromoterAlliancesView';
import PromoterWorkspaceProtocols from './PromoterWorkspaceProtocols';

interface PromoterDashboardViewV2Props {
  userProfile: UserProfile;`);

fs.writeFileSync('src/components/PromoterDashboardViewV2.tsx', file);
