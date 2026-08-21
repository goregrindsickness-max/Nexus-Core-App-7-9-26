import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                  </div>                             let tabButtons = [];`;
const replacement = `                  </div>

                {/* Profile Tabs Navigation */}
                {(() => {
                  const r = selectedUserProfile.role.toLowerCase();
                  const isArtist = r.includes('artist') || r.includes('band');
                  const isLabel = r.includes('label');
                  const isPromoter = r.includes('promoter');
                  const isCreative = r.includes('creative');

                  let tabButtons = [];`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully replaced exact target string!");
} else {
  console.log("Target string not found");
}
