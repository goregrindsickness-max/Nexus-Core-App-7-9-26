const fs = require('fs');
let code = fs.readFileSync('src/supabase.ts', 'utf8');

code = code.replace(
  `  const profileStr = localStorage.getItem('nexus_core_user_profile');`,
  `  let profileStr = null; try { profileStr = localStorage.getItem('nexus_core_user_profile'); } catch(e) {}`
);

code = code.replace(
  `    const saved = localStorage.getItem(\`nexus_core_\${portalType}_supabase_url\`);`,
  `    let saved = null; try { saved = localStorage.getItem(\`nexus_core_\${portalType}_supabase_url\`); } catch(e) {}`
);

code = code.replace(
  `    const saved = localStorage.getItem(\`nexus_core_\${portalType}_supabase_key\`);`,
  `    let saved = null; try { saved = localStorage.getItem(\`nexus_core_\${portalType}_supabase_key\`); } catch(e) {}`
);

code = code.replace(
  `      const raw = localStorage.getItem('nexus_core_offline_write_queue');`,
  `      let raw = null; try { raw = localStorage.getItem('nexus_core_offline_write_queue'); } catch(e) {}`
);

code = code.replace(
  `        localStorage.removeItem('nexus_core_offline_write_queue');`,
  `        try { localStorage.removeItem('nexus_core_offline_write_queue'); } catch(e) {}`
);

fs.writeFileSync('src/supabase.ts', code);
console.log('Fixed localStorage accesses in supabase.ts');
