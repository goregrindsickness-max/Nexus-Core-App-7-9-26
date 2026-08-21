const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /localStorage\.setItem\(\`nexus_core_\$\{userProfile\?\.id\}_bands\`, JSON\.stringify\(bands\)\);/g,
  "profileStore.setItem(`nexus_core_${userProfile?.id}_bands`, bands);"
);

fs.writeFileSync('src/App.tsx', code);
