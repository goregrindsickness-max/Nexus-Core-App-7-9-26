#!/bin/bash

# 1. Update interfaces
for file in src/components/CreativeDashboardViewV2.tsx src/components/LabelDashboardViewV2.tsx src/components/PromoterDashboardViewV2.tsx src/components/PromoterPortalView.tsx; do
  sed -i 's/triggerNotification\?: (m.*) => void;/triggerNotification?: (msg: string) => void;\n  onUpgradeToPro?: () => void;/g' $file
done

# 2. Add onUpgradeToPro to component props
sed -i 's/addLog,$/addLog, onUpgradeToPro,/g' src/components/CreativeDashboardViewV2.tsx
sed -i 's/triggerNotification,$/triggerNotification, onUpgradeToPro,/g' src/components/LabelDashboardViewV2.tsx
sed -i 's/addLog,$/addLog, onUpgradeToPro,/g' src/components/PromoterDashboardViewV2.tsx
sed -i 's/addLog,$/addLog, onUpgradeToPro,/g' src/components/PromoterPortalView.tsx

# 3. Update isAllowed in all 4 files
for file in src/components/CreativeDashboardViewV2.tsx src/components/LabelDashboardViewV2.tsx src/components/PromoterDashboardViewV2.tsx src/components/PromoterPortalView.tsx; do
  sed -i "s/const isAllowed = (portal.key === 'fan' || portal.key === 'fan_only') || (/const isAllowed = (portal.key === 'industry_pro' || portal.key === 'fan' || portal.key === 'fan_only') || (/g" $file
done

# 4. Update the locked portal onClick in all 4 files
for file in src/components/CreativeDashboardViewV2.tsx src/components/LabelDashboardViewV2.tsx src/components/PromoterDashboardViewV2.tsx src/components/PromoterPortalView.tsx; do
  sed -i "s/triggerNotification?.\(\`💡 Upgrade clearance to unlock \${portal.name}.\`\);/if (typeof window !== 'undefined') { localStorage.setItem('nexus_target_register_workspace', portal.key); }\n                                  triggerNotification?.(\`Redirecting to enrollment wizard for \${portal.name}...\`);\n                                  onUpgradeToPro?.();/g" $file
done

