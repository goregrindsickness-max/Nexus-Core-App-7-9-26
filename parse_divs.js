const fs = require('fs');
const content = fs.readFileSync('src/components/social/modals/PublicProfileModal.tsx', 'utf8');

// Regex to find all opening tags that are div or motion.div, but NOT self-closing!
// And all closing tags </div> or </motion.div>
let depth = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  // Remove self-closing div tags for accurate count
  let cleanLine = line.replace(/<motion\.div[^>]*\/>/g, '').replace(/<div[^>]*\/>/g, '');
  
  let openCount = (cleanLine.match(/<div\b/g) || []).length + (cleanLine.match(/<motion\.div\b/g) || []).length;
  let closeCount = (cleanLine.match(/<\/div>/g) || []).length + (cleanLine.match(/<\/motion\.div>/g) || []).length;
  
  depth += (openCount - closeCount);
  if (openCount - closeCount !== 0) {
    // console.log(`Line ${i+1}: ${depth} (delta ${openCount - closeCount})`);
  }
}
console.log("FINAL DEPTH:", depth);
