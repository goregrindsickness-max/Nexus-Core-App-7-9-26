const fs = require('fs');
let content = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

const regex = /const unsub1 = subscribeToTable\('nexus_posts', \(payload\) => \{([\s\S]*?)const unsub2 = subscribeToTable/g;

// Instead of regex, I'll just write a script that replaces the entire useEffect for realtime syncing.
