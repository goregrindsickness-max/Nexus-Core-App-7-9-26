const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                || s.id === 'show_stop_102' || s.id === 'show_stop_103');
                if (isFallback) {
                  return [payload.new as Show];
                }`;

content = content.replace(target, ``);
fs.writeFileSync('src/App.tsx', content);
console.log("Fixed App.tsx regex oopsie 2");
