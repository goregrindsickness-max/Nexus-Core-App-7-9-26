const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace setIsLoggedOut(true) with window.location.reload() in all onLogout/onBack functions where we handle logout.
// Wait, we also need to clear localStorage before reload.
const updated = appTsx.replace(/localStorage\.removeItem\('nexus_core_user_profile'\);\s*setUserProfile\(null\);\s*setIsLoggedOut\(true\);/g, "localStorage.removeItem('nexus_core_user_profile'); setUserProfile(null); window.location.reload();");

fs.writeFileSync('src/App.tsx', updated);
console.log('Reload patched');
