const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `    const baseFollowers = (() => {
      let hash = 0;
      const str = user.name || '';
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % 150 + 20;
    })();
    const baseFollowing = (() => {
      let hash = 0;
      const str = (user.name || '') + "_following";
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % 80 + 10;
    })();
    const followersCount = isYou 
      ? discoverProfiles.filter(p => p.followed && (p as any).followedBack).length
      : (baseFollowers + (discoverProfiles.find(dp => dp.name.toLowerCase() === user.name.toLowerCase())?.followed ? 1 : 0));
    const followingCount = isYou 
      ? discoverProfiles.filter(p => p.followed).length
      : (baseFollowing + ((discoverProfiles.find(dp => dp.name.toLowerCase() === user.name.toLowerCase()) as any)?.followedBack ? 1 : 0));`;

const rep = `    const identifiers = [
      dbProfile?.id,
      dbProfile?.email,
      dbProfile?.name,
      dbProfile?.full_name,
      dbProfile?.console_handle,
      user.name
    ].filter(Boolean).map(s => String(s).toLowerCase().trim());

    const actualFollowers = allFollows.filter(f => identifiers.includes(String(f.artist_id).toLowerCase().trim())).length;
    const actualFollowing = allFollows.filter(f => identifiers.includes(String(f.fan_profile_id).toLowerCase().trim())).length;

    const baseFollowers = (() => {
      if (actualFollowers > 0) return actualFollowers;
      let hash = 0;
      const str = user.name || '';
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % 150 + 20;
    })();
    const baseFollowing = (() => {
      if (actualFollowing > 0) return actualFollowing;
      let hash = 0;
      const str = (user.name || '') + "_following";
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % 80 + 10;
    })();

    const followersCount = isYou 
      ? actualFollowers 
      : (actualFollowers > 0 ? actualFollowers : baseFollowers + (discoverProfiles.find(dp => dp.name.toLowerCase() === user.name.toLowerCase())?.followed ? 1 : 0));
    const followingCount = isYou 
      ? actualFollowing
      : (actualFollowing > 0 ? actualFollowing : baseFollowing + ((discoverProfiles.find(dp => dp.name.toLowerCase() === user.name.toLowerCase()) as any)?.followedBack ? 1 : 0));`;

code = code.replace(target, rep);
fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
