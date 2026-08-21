import fs from 'fs';

const filePath = 'src/components/UniversalSocialFeed.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('let tabButtons = [];')) {
    console.log("Found target line at index", i);
    lines[i] = `                {/* Profile Tabs Navigation */}
                {(() => {
                  const r = selectedUserProfile.role.toLowerCase();
                  const isArtist = r.includes('artist') || r.includes('band');
                  const isLabel = r.includes('label');
                  const isPromoter = r.includes('promoter');
                  const isCreative = r.includes('creative');

                  let tabButtons = [];`;
    break;
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log("Replaced line successfully!");
