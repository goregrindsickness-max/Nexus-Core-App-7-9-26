const fs = require('fs');
const content = fs.readFileSync('src/components/navigation/BrandNavigationHeader.tsx', 'utf8');
const esbuild = require('esbuild');
try {
  esbuild.transformSync(content, { loader: 'tsx' });
  console.log("No syntax errors in BrandNavigationHeader.tsx!");
} catch (e) {
  console.error("Syntax error:", e.message);
}
