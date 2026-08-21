const fs = require('fs');
const code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

// A very naive AST or regex check
// Actually, let's just use grep for set[A-Z] that are not within useEffect, useMemo, useCallback, handlers, or promises.

