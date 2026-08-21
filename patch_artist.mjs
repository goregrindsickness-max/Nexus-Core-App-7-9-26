import fs from 'fs';

let content = fs.readFileSync('src/components/profile/ArtistProfileCard.tsx', 'utf8');

// The artist mapping uses baseTarget mostly, ignores bData
content = content.replace(/const effTarget = \{[\s\S]*?\}  \};/m, `const effTarget = {
    ...baseTarget,
    name: baseTarget?.name || baseTarget?.legalName || baseTarget?.full_name || 'Artist',
    console_handle: baseTarget?.console_handle || baseTarget?.handle || 'artist',
    avatar: baseTarget?.avatar_url || baseTarget?.avatar || baseTarget?.creative_avatar,
    avatar_url: baseTarget?.avatar_url || baseTarget?.avatar || baseTarget?.creative_avatar,
    banner: baseTarget?.banner_url || baseTarget?.banner || baseTarget?.cover_url,
    banner_url: baseTarget?.banner_url || baseTarget?.banner || baseTarget?.cover_url,
  };`);

fs.writeFileSync('src/components/profile/ArtistProfileCard.tsx', content);
console.log("ArtistProfileCard mapped.");
