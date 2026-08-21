const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/if \(show\.id === "show_stop_101"\) return \{ lat: 41\.9103, lng: -87\.6775 \};\n/g, '');
content = content.replace(/const isFallback = prev\.some\(s => s\.id === 'show_stop_101' || s\.id === 'show_stop_102' || s\.id === 'show_stop_103'\);\n              if \(isFallback\) {\n                return \[payload\.new as Show\];\n              }/g, '');

// Also let's fix the sale fallback in App.tsx
content = content.replace(/const isFallback = prev\.some\(s => s\.id === 'sale_01' || s\.id === 'sale_02'\);\n              if \(isFallback\) {\n                return \[payload\.new as Sale\];\n              }/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log("Patched fallback IDs in App.tsx");
