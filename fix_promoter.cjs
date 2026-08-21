const fs = require('fs');

function fixFile(path, v) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(new RegExp(`\\s*<button[^>]*>\\s*Switch to V${v}\\s*</button>\\s*\\)}\\s*`, 'i'), '');
  fs.writeFileSync(path, content);
}

fixFile('src/components/PromoterDashboardViewV2.tsx', 1);
fixFile('src/components/PromoterPortalView.tsx', 2);
