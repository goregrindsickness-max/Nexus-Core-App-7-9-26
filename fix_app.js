import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace for CreativeDashboardViewV2
content = content.replace(
  '<CreativeDashboardViewV2\n                userProfile={userProfile}',
  '<CreativeDashboardViewV2\n                onUpgradeToPro={() => setShowWorkspaceRegistration(true)}\n                userProfile={userProfile}'
);

// Replace for LabelDashboardViewV2
content = content.replace(
  '<LabelDashboardViewV2\n                userProfile={userProfile}',
  '<LabelDashboardViewV2\n                onUpgradeToPro={() => setShowWorkspaceRegistration(true)}\n                userProfile={userProfile}'
);

// Replace for PromoterDashboardViewV2
content = content.replace(
  '<PromoterDashboardViewV2\n                userProfile={userProfile}',
  '<PromoterDashboardViewV2\n                onUpgradeToPro={() => setShowWorkspaceRegistration(true)}\n                userProfile={userProfile}'
);

fs.writeFileSync('src/App.tsx', content);
