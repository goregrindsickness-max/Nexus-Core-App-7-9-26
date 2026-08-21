import fetch from 'node-fetch';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

async function fetchSchema() {
  const targetUrl = `${url}/rest/v1/`;
  console.log('Fetching API schema from:', targetUrl);
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Accept': 'application/json'
      }
    });
    const schema: any = await res.json();
    if (schema && schema.paths) {
      console.log('Available tables in paths:', Object.keys(schema.paths));
      
      const chatPaths = Object.keys(schema.paths).filter(p => p.includes('chat'));
      console.log('Chat-related paths:', chatPaths);
      
      chatPaths.forEach(p => {
        console.log(`Path ${p} detail:`, JSON.stringify(schema.paths[p], null, 2));
      });

      if (schema.definitions) {
        const chatDefs = Object.keys(schema.definitions).filter(d => d.includes('chat'));
        console.log('Chat-related definitions:', chatDefs);
        chatDefs.forEach(d => {
          console.log(`Definition ${d}:`, JSON.stringify(schema.definitions[d], null, 2));
        });
      }
    } else {
      console.log('Invalid response:', schema);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

fetchSchema();
