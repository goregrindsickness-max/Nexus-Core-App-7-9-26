const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const syncLogicTarget = `        // Push live updates to supabase if online
        const supabase = getSupabase();
        const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        if (supabase && navigator.onLine && userProfile.id && isValidUUID(userProfile.id)) {
          executeWithSchemaResilience(
            async (payload) => await supabase.from('profiles').upsert([payload]),
            userProfile
          ).then(({error}) => {
            if (error) console.error('Failed to sync profile to Supabase:', error);
          });
        }`;

content = content.replace(syncLogicTarget, `        // Automatic upsert to supabase removed to prevent ghost profiles.`);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx upsert");
