const fs = require('fs');
let file = fs.readFileSync('./src/components/UniversalSocialFeed.tsx', 'utf8');

if (!file.includes("import { BAND_PORTAL_BILLING }")) {
  file = file.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport { BAND_PORTAL_BILLING } from '../config/billingMatrix';");
}

file = file.replace(
  /1 Token \/ \$3\.99/g,
  `\${BAND_PORTAL_BILLING.onDemandBoosts.show_blast_24h.tokenCost} Token / $\${BAND_PORTAL_BILLING.onDemandBoosts.show_blast_24h.cashPrice}`
);

file = file.replace(
  /2 Tokens \/ \$7\.99/g,
  `\${BAND_PORTAL_BILLING.onDemandBoosts.tour_announcement_72h.tokenCost} Tokens / $\${BAND_PORTAL_BILLING.onDemandBoosts.tour_announcement_72h.cashPrice}`
);

file = file.replace(
  /⚡ 24-Hour Show Blast/g,
  `⚡ \${BAND_PORTAL_BILLING.onDemandBoosts.show_blast_24h.name}`
);

file = file.replace(
  /🔥 72-Hour Tour Announcement/g,
  `🔥 \${BAND_PORTAL_BILLING.onDemandBoosts.tour_announcement_72h.name}`
);

file = file.replace(
  /'⚡ 24-Hour Show Blast Activated'/g,
  "`⚡ ${BAND_PORTAL_BILLING.onDemandBoosts.show_blast_24h.name} Activated`"
);

file = file.replace(
  /'🔥 72-Hour Tour Announcement Activated'/g,
  "`🔥 ${BAND_PORTAL_BILLING.onDemandBoosts.tour_announcement_72h.name} Activated`"
);

fs.writeFileSync('./src/components/UniversalSocialFeed.tsx', file);
console.log('Fixed feed boosts in UniversalSocialFeed.tsx');
