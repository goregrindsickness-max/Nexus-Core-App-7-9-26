const fs = require('fs');
let file = fs.readFileSync('./src/components/PlansView.tsx', 'utf8');

file = file.replace(
  /<span className="text-sm font-bold text-\[\#10B981\]">\{'\$/g,
  `<span className="text-sm font-bold text-[#10B981]">$\${BAND_PORTAL_BILLING.singleUsePasses.per_show.price}</span>\n//`
);

fs.writeFileSync('./src/components/PlansView.tsx', file);
