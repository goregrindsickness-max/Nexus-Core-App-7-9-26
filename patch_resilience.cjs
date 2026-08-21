const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const profileTarget = `        if (supabase && navigator.onLine) {
          supabase.from('profiles').upsert([userProfile]).then(({error}) => {
            if (error) console.error('Failed to sync profile to Supabase:', error);
          });
        }`;
const profileReplacement = `        if (supabase && navigator.onLine) {
          executeWithSchemaResilience(
            async (payload) => await supabase.from('profiles').upsert([payload]),
            userProfile
          ).then(({error}) => {
            if (error) console.error('Failed to sync profile to Supabase:', error);
          });
        }`;
content = content.replace(profileTarget, profileReplacement);

const bandTarget = `      if (supabase && navigator.onLine && bands.length > 0) {
        supabase.from('bands').upsert(bands).then(({error}) => {
           if (error) console.error('Failed to sync bands to Supabase:', error);
        });
      }`;
const bandReplacement = `      if (supabase && navigator.onLine && bands.length > 0) {
        Promise.all(bands.map(band => 
          executeWithSchemaResilience(
            async (payload) => await supabase.from('bands').upsert([payload]),
            band
          )
        )).then(results => {
           const errors = results.filter(r => r.error).map(r => r.error);
           if (errors.length > 0) console.error('Failed to sync some bands to Supabase:', errors);
        });
      }`;
content = content.replace(bandTarget, bandReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Done patch resilience');
