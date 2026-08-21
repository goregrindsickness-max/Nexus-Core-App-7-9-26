import fs from 'fs';

let file = fs.readFileSync('./src/components/UniversalSocialFeed.tsx', 'utf8');

if (!file.includes('PLATFORM_TRANSACTION_FEES')) {
  file = file.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport { PLATFORM_TRANSACTION_FEES } from '../constants/fees';");
}

let modified = false;

if (file.includes('checkoutItem.data.price * quantity}')) {
  file = file.replace(/<div className="text-right font-mono font-bold text-rose-400">\s*\$\{(checkoutItem\.data\.price \* quantity)\}\s*<\/div>/g, 
  `<div className="text-right font-mono font-bold text-rose-400">
                        \${$1}
                        <div className="text-[10px] text-zinc-500 font-normal mt-1">+ \${(($1) * PLATFORM_TRANSACTION_FEES.merchandise.percentage).toFixed(2)} platform fee</div>
                      </div>`);
  modified = true;
}

if (file.includes('parseInt(checkoutItem.data.priceRange?.match')) {
  file = file.replace(/<div className="font-mono font-bold text-rose-400">\s*\$\{\(parseInt\(checkoutItem\.data\.priceRange\?\.match\(\/\\\$(\\\d\+)\/\)\?\.\[1\] \|\| '25'\)\) \* quantity\}\s*<\/div>/g, 
  `<div className="text-right font-mono font-bold text-rose-400">
                          \${(parseInt(checkoutItem.data.priceRange?.match(/\\$(\\d+)/)?.[1] || '25')) * quantity}
                          <div className="text-[10px] text-zinc-500 font-normal mt-1">+ \${((parseInt(checkoutItem.data.priceRange?.match(/\\$(\\d+)/)?.[1] || '25') * quantity) * PLATFORM_TRANSACTION_FEES.ticketing.percentage + PLATFORM_TRANSACTION_FEES.ticketing.fixed).toFixed(2)} platform fee</div>
                        </div>`);
}

if (modified) {
  fs.writeFileSync('./src/components/UniversalSocialFeed.tsx', file);
  console.log('Fixed UniversalSocialFeed.tsx');
}
