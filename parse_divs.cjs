const fs = require('fs');
const content = fs.readFileSync('src/components/social/modals/PublicProfileModal.tsx', 'utf8');

let depth = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let cleanLine = line.replace(/<motion\.div[^>]*\/>/g, '').replace(/<div[^>]*\/>/g, '');
  
  let openCount = (cleanLine.match(/<div\b/g) || []).length + (cleanLine.match(/<motion\.div\b/g) || []).length;
  let closeCount = (cleanLine.match(/<\/div>/g) || []).length + (cleanLine.match(/<\/motion\.div>/g) || []).length;
  
  depth += (openCount - closeCount);
  if (depth < 0) {
     console.log(`NEGATIVE DEPTH AT LINE ${i+1}: ${depth}`);
     break;
  }
}
console.log("FINAL DEPTH:", depth);
