import fs from 'fs';
fs.appendFileSync('supabase-schema.sql', '\n\n' + fs.readFileSync('add_source_splits.sql', 'utf8'));
console.log('Appended to supabase-schema.sql');
