const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const target = `  // Autosave triggers on state adjustments
  useEffect(() => {
    if (!isLoadedRef.current) return;
    saveProfileData(false);
  }, [`;

const replacement = `  // Autosave triggers on state adjustments
  useEffect(() => {
    if (!isLoadedRef.current) return;
    const saveTimer = setTimeout(() => {
      saveProfileData(false);
    }, 800);
    return () => clearTimeout(saveTimer);
  }, [`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
  console.log('Patch 8 applied!');
} else {
  console.log('Target 8 not found!');
}
