const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      let currentActiveBandId = activeBandId;

      if (userProfile?.id === 'profile_admin') {
        const adminBands = cachedBandsStr ? JSON.parse(cachedBandsStr) : dbBands;
        setBands(adminBands);
        const adminActiveId = cachedActiveBandIdStr || (adminBands[0]?.id || 'band_virulent_01');
        setActiveBandId(adminActiveId);
        currentActiveBandId = adminActiveId;
      } else {
        const userBands = cachedBandsStr ? JSON.parse(cachedBandsStr) : [];
        setBands(userBands);
        const userActiveId = cachedActiveBandIdStr || (userBands[0]?.id || '');
        setActiveBandId(userActiveId);
        currentActiveBandId = userActiveId;
      }`;

const replacement = `      let currentActiveBandId = activeBandId;

      if (userProfile?.id === 'profile_admin') {
        const adminBands = cachedBands ? cachedBands : dbBands;
        setBands(adminBands);
        const adminActiveId = cachedActiveBandIdStr || (adminBands[0]?.id || 'band_virulent_01');
        setActiveBandId(adminActiveId);
        currentActiveBandId = adminActiveId;
      } else {
        const userBands = cachedBands ? cachedBands : [];
        setBands(userBands);
        const userActiveId = cachedActiveBandIdStr || (userBands[0]?.id || '');
        setActiveBandId(userActiveId);
        currentActiveBandId = userActiveId;
      }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patch 6 applied!');
} else {
  console.log('Target 6 not found!');
}
