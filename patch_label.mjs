import fs from 'fs';

let content = fs.readFileSync('src/components/profile/LabelProfileCard.tsx', 'utf8');

// The label mapping uses baseTarget mostly, ignores bData
content = content.replace(/const effTarget = \{[\s\S]*?\}  \};/m, `const effTarget = {
    ...baseTarget,
    name: baseTarget?.name || baseTarget?.legalName || baseTarget?.full_name || 'Label',
    console_handle: baseTarget?.console_handle || baseTarget?.handle || 'label',
    avatar: baseTarget?.avatar_url || baseTarget?.avatar || baseTarget?.label_logo,
    avatar_url: baseTarget?.avatar_url || baseTarget?.avatar || baseTarget?.label_logo,
    banner: baseTarget?.banner_url || baseTarget?.banner || baseTarget?.cover_url,
    banner_url: baseTarget?.banner_url || baseTarget?.banner || baseTarget?.cover_url,
  };`);

fs.writeFileSync('src/components/profile/LabelProfileCard.tsx', content);
console.log("LabelProfileCard mapped.");
