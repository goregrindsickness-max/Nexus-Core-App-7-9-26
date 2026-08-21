import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure initOfflineQueue is imported
if (!content.includes('initOfflineQueue')) {
  content = content.replace(
    "import { getSupabase",
    "import { initOfflineQueue, getSupabase"
  );
}

// Add initOfflineQueue to hydrateStores
content = content.replace(
  "const hydrateStores = async () => {\n      try {",
  "const hydrateStores = async () => {\n      try {\n        await initOfflineQueue();"
);

fs.writeFileSync('src/App.tsx', content);
console.log('Added initOfflineQueue');
