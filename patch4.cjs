const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /localStorage\.setItem\(\`nexus_core_\$\{userProfile\?\.id\}_active_band_id\`, activeBandId\);/g,
  "profileStore.setItem(`nexus_core_${userProfile?.id}_active_band_id`, activeBandId);"
);

code = code.replace(
  /localStorage\.setItem\('nexus_core_user_profile', JSON\.stringify\(userProfile\)\);/g,
  "profileStore.setItem('nexus_core_user_profile', userProfile);"
);

fs.writeFileSync('src/App.tsx', code);
