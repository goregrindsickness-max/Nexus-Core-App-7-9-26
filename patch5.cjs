const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  // Load account-specific offline caches instantly upon context/tenant switch to allow pristine clean slates
  useEffect(() => {
    if (!userProfile) return;
    
    try {
      // 1. First setup namespaced bands lists & active contexts to assure decoupling
      const cachedBandsStr = localStorage.getItem(\`nexus_core_\${userProfile?.id}_bands\`);
      const cachedActiveBandIdStr = localStorage.getItem(\`nexus_core_\${userProfile?.id}_active_band_id\`);`;

const replacement = `  // Load account-specific offline caches instantly upon context/tenant switch to allow pristine clean slates
  useEffect(() => {
    if (!userProfile) return;
    
    const loadCaches = async () => {
    try {
      // 1. First setup namespaced bands lists & active contexts to assure decoupling
      let cachedBands = await profileStore.getItem(\`nexus_core_\${userProfile?.id}_bands\`);
      let cachedActiveBandIdStr = await profileStore.getItem(\`nexus_core_\${userProfile?.id}_active_band_id\`);
      
      // Fallback to localStorage for backward compatibility if IndexedDB is empty
      if (!cachedBands) {
        const legacyBands = localStorage.getItem(\`nexus_core_\${userProfile?.id}_bands\`);
        if (legacyBands) cachedBands = JSON.parse(legacyBands);
      }
      if (!cachedActiveBandIdStr) {
        cachedActiveBandIdStr = localStorage.getItem(\`nexus_core_\${userProfile?.id}_active_band_id\`);
      }
      `;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patch 5 applied!');
} else {
  console.log('Target 5 not found!');
}
