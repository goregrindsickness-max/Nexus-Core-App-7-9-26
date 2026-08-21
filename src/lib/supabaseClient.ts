import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cyjnpuneruonskfzpmqo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5am5wdW5lcnVvbnNrZnpwbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTA1NjIsImV4cCI6MjA5NTQyNjU2Mn0.94h4Ao-cpLXwU8xxJsKln0iud2wOw746yZlAdFP2gDM';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase Singleton] Missing Supabase URL or Anon Key environment variables.');
}

// Single exported instance across the entire app bundle
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'nexus_core_auth_token', // Unique explicit storage key
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export default supabase;

