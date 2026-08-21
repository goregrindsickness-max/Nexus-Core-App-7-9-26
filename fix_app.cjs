const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `              // 2. Clear out seed/fallback entries if we have them
              || s.id === 'sale_02');
              if (isFallback) {
                return [payload.new as Sale];
              }`;

content = content.replace(target, `              // 2. Clear out seed/fallback entries if we have them`);
fs.writeFileSync('src/App.tsx', content);
console.log("Fixed App.tsx regex oopsie");
