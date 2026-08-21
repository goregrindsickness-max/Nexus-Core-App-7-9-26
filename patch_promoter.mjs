import fs from 'fs';

let content = fs.readFileSync('src/components/profile/PromoterProfileCard.tsx', 'utf8');

// The promoter mapping uses baseTarget mostly, ignores bData
content = content.replace(/const effTarget = \{[\s\S]*?\}  \};/m, `const effTarget = {
    ...baseTarget,
    name: baseTarget?.name || baseTarget?.legalName || baseTarget?.full_name || 'Promoter',
    console_handle: baseTarget?.console_handle || baseTarget?.handle || 'promoter',
    avatar: baseTarget?.avatar_url || baseTarget?.avatar || baseTarget?.promoter_logo,
    avatar_url: baseTarget?.avatar_url || baseTarget?.avatar || baseTarget?.promoter_logo,
    banner: baseTarget?.banner_url || baseTarget?.banner || baseTarget?.cover_url,
    banner_url: baseTarget?.banner_url || baseTarget?.banner || baseTarget?.cover_url,
  };`);

fs.writeFileSync('src/components/profile/PromoterProfileCard.tsx', content);
console.log("PromoterProfileCard mapped.");
