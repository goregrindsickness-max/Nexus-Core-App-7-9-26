import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://s6jhaejrxpqgkdr7esx5hy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const miguelId = '421610eb-3a87-4da6-b843-1adb4ab6aecb';

  async function run() {
    const { data: profiles, error } = await supabase.from('profiles').select('id, email');
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    console.log(`Found ${profiles?.length} profiles in database.`);

    for (const p of profiles || []) {
      if (p.id !== miguelId) {
        const { error: followErr } = await supabase.from('follows').upsert([
          { follower_id: p.id, followed_id: miguelId }
        ], { onConflict: 'follower_id,followed_id' });
        
        if (followErr) {
          console.log(`Follow error for profile ${p.id}:`, followErr.message);
        } else {
          console.log(`Successfully added follow from ${p.email || p.id} -> Miguel`);
        }
      }
    }
  }

  run();
}
