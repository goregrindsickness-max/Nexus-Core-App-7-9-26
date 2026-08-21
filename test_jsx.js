const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

// just look for the first syntax error using esbuild
const esbuild = require('esbuild');
try {
  esbuild.transformSync(content, { loader: 'tsx' });
  console.log("No syntax errors in App.tsx!");
} catch (e) {
  console.error("Syntax error:", e.message);
}
