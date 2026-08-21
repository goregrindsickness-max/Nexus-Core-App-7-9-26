import fs from 'fs';

let content = fs.readFileSync('src/components/profile/BandProfileCard.tsx', 'utf8');

// 1. Remove badges logic for personal profiles
content = content.replace(/const isMiguelProfile = \([\s\S]*?\}\)/g, ''); // not enough, there are multiple things

// Let's replace the whole effTarget block
content = content.replace(/const effTarget = \{[\s\S]*?\}  \};/m, `const effTarget = {
    ...baseTarget,
    ...(bData ? {
      name: bData.band_name || bData.name || baseTarget.name || baseTarget.band_name,
      band_name: bData.band_name || bData.name || baseTarget.band_name || baseTarget.name,
      avatar: bData.logo_url || bData.avatar_url || baseTarget.avatar || baseTarget.avatar_url || baseTarget.logo_url,
      avatar_url: bData.logo_url || bData.avatar_url || baseTarget.avatar_url || baseTarget.avatar || baseTarget.logo_url,
      banner: bData.cover_url || bData.banner_url || baseTarget.banner || baseTarget.banner_url || baseTarget.cover_url,
      banner_url: bData.cover_url || bData.banner_url || baseTarget.banner_url || baseTarget.banner || baseTarget.cover_url,
      cover_url: bData.cover_url || baseTarget.cover_url || bData.banner_url || baseTarget.banner_url,
      logo_url: bData.logo_url || baseTarget.logo_url || bData.avatar_url || baseTarget.avatar_url,
      city: bData.city || baseTarget.city,
      state_province: bData.state_province || baseTarget.state_province,
      country: bData.country || baseTarget.country,
      homebase: bData.homebase || (bData.city ? \`\${bData.city}\${bData.state_province ? ', ' + bData.state_province : ''}\${bData.country ? ', ' + bData.country : ''}\` : baseTarget.homebase),
      bio: bData.bio || baseTarget.bio,
      custom_slug: bData.custom_slug || baseTarget.custom_slug,
      console_handle: bData.custom_slug ? \`@\${bData.custom_slug.replace('@', '')}\` : (baseTarget.console_handle || baseTarget.handle),
      genre: bData.genre || baseTarget.genre,
      genre_tags: bData.genre_tags || (bData.genre ? [bData.genre] : baseTarget.genre_tags),
      lineup: bData.lineup || baseTarget.lineup,
      streaming_url: bData.streaming_url || baseTarget.streaming_url,
      featured_youtube_url: bData.featured_youtube_url || baseTarget.featured_youtube_url,
      metal_archives_url: bData.metal_archives_url || baseTarget.metal_archives_url,
      booking_email: bData.booking_email || baseTarget.booking_email,
      booking_phone: bData.booking_phone || baseTarget.booking_phone,
    } : {
      name: baseTarget?.band_name || baseTarget?.name || 'Band',
      band_name: baseTarget?.band_name || baseTarget?.name || 'Band',
      console_handle: baseTarget?.console_handle || baseTarget?.handle || 'band',
      avatar: baseTarget?.logo_url || baseTarget?.avatar_url || baseTarget?.avatar,
      avatar_url: baseTarget?.logo_url || baseTarget?.avatar_url || baseTarget?.avatar,
      banner: baseTarget?.cover_url || baseTarget?.banner_url || baseTarget?.banner,
      banner_url: baseTarget?.cover_url || baseTarget?.banner_url || baseTarget?.banner,
      cover_url: baseTarget?.cover_url || baseTarget?.banner_url || baseTarget?.banner,
      logo_url: baseTarget?.logo_url || baseTarget?.avatar_url || baseTarget?.avatar,
      metal_archives_url: baseTarget?.metal_archives_url,
    })
  };`);

// Replace the Miguel badges block to remove it
content = content.replace(/const isMiguelProfile = \([\s\S]*?\}\)/, 'const isMiguelProfile = false;');

fs.writeFileSync('src/components/profile/BandProfileCard.tsx', content);
console.log("BandProfileCard mapped.");
