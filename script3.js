import fs from 'fs';
const content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');
const lines = content.split('\n');
const start = 4082;
const end = 5172;

const replacement = `          {activeTab === 'social' && (
            <div className="w-full h-full flex flex-col">
              <UniversalSocialFeed 
                userProfile={userProfile} 
                setUserProfile={setUserProfile} 
                onLogout={onLogout} 
                triggerNotification={triggerNotification} 
                portalRole="label" 
              />
            </div>
          )}`;

lines.splice(start - 1, end - start + 1, replacement);

const importStatement = "import { UniversalSocialFeed } from './UniversalSocialFeed';";
lines.splice(5, 0, importStatement);

fs.writeFileSync('src/components/LabelDashboardView.tsx', lines.join('\n'));
console.log('Replaced successfully for LabelDashboardView');
