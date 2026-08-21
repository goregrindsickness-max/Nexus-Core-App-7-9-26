const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// We want to add the real-time subscription for `notes`
// And we want to patch `syncPostToSupabase` into the missing mutations.

// Let's first just find all places where `setFeed(prev => prev.map(post => {` occurs, 
// and inject `syncPostToSupabase(updatedPost)` before returning.

content = content.replace(/import \{ getSupabase, resolveZipCode \} from '\.\.\/supabase';/g, "import { getSupabase, resolveZipCode, subscribeToTable } from '../supabase';");

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', content);
console.log("Imports updated.");
