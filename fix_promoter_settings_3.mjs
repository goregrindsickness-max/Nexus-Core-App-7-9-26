import fs from 'fs';

let content = fs.readFileSync('src/components/PromoterSettingsTab.tsx', 'utf-8');

content = content.replace(
  "useState<string | null>('profile_ab')",
  "useState<string | null>(null)"
);

fs.writeFileSync('src/components/PromoterSettingsTab.tsx', content);
console.log("Done3");
