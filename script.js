import fs from 'fs';
const content = fs.readFileSync('src/components/PromoterPortalView.tsx', 'utf8');
const lines = content.split('\n');
const start = 7981;
const end = 8754;

const replacement = `      ) : activePortalTab === 'social' ? (
        <UniversalSocialFeed 
          userProfile={userProfile} 
          setUserProfile={setUserProfile} 
          onLogout={onLogout} 
          triggerNotification={triggerNotification} 
          portalRole="promoter" 
        />`;

lines.splice(start - 1, end - start + 1, replacement);
fs.writeFileSync('src/components/PromoterPortalView.tsx', lines.join('\n'));
console.log('Replaced successfully');
