const fs = require('fs');
let content = fs.readFileSync('src/supabase.ts', 'utf8');

content = content.replace(
  /\.channel\(\`\$\{table\}-realtime-changes\`\)/,
  "\.channel(\`\${table}-realtime-changes-\${Date.now()}-\${Math.random()}\`)"
);

fs.writeFileSync('src/supabase.ts', content);
console.log("Fixed supabase channel name");
