import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, anonKey);

async function testSelectColumns() {
  console.log('Selecting id from nexus_chats...');
  const resId = await supabase.from('nexus_chats').select('id');
  console.log('id select:', resId.error ? resId.error.message : 'Success');

  console.log('Selecting data from nexus_chats...');
  const resData = await supabase.from('nexus_chats').select('data');
  console.log('data select:', resData.error ? resData.error.message : 'Success');

  console.log('Selecting created_at from nexus_chats...');
  const resCreated = await supabase.from('nexus_chats').select('created_at');
  console.log('created_at select:', resCreated.error ? resCreated.error.message : 'Success');
}

testSelectColumns();
