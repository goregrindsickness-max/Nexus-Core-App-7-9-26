const fs = require('fs');
let file = fs.readFileSync('./src/components/TeamBillingTab.tsx', 'utf8');

file = file.replace(
  /const PLAN_LIMITS = \{[\s\S]*?\};/,
  `const PLAN_LIMITS: Record<string, number> = {
    'free_for_life': 1,
    'power_user_pro': 2,
    'enterprise_circuit': 999,
    'touring_pro': BAND_PORTAL_BILLING.tiers.touring_pro.teamSeatLimit,
    'touring_pro_plus': BAND_PORTAL_BILLING.tiers.touring_pro_plus.teamSeatLimit,
    // fallback mappings
    'BASE': 2,
    'MID': BAND_PORTAL_BILLING.tiers.touring_pro.teamSeatLimit,
    'UNLIMITED': BAND_PORTAL_BILLING.tiers.touring_pro_plus.teamSeatLimit
  };`
);

// We need to resolve `currentPlan` to the correct key.
file = file.replace(
  /const currentLimit = PLAN_LIMITS\[currentPlan\];/,
  `const activeTierId = userProfile?.sub_tier || 'BASE';
  const currentLimit = PLAN_LIMITS[activeTierId] || PLAN_LIMITS[currentPlan] || 2;`
);

fs.writeFileSync('./src/components/TeamBillingTab.tsx', file);
