import fs from 'fs';

let file = fs.readFileSync('./src/components/CustomerPayView.tsx', 'utf8');

if (!file.includes('PLATFORM_TRANSACTION_FEES')) {
  file = file.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport { PLATFORM_TRANSACTION_FEES } from '../constants/fees';");
}

let modified = false;

if (file.includes('const totalWithTax = finalAmount + taxAmount;')) {
  const replacement = `
  const isTicketItem = compactCart.length === 0 || compactCart.some(item => {
    const dbItem = storeItems.find(x => x.sku === item.sku);
    return !dbItem || dbItem.category === 'TICKET' || item.name.toLowerCase().includes('ticket');
  });

  const platformFee = isTicketItem
    ? (finalAmount * PLATFORM_TRANSACTION_FEES.ticketing.percentage) + (PLATFORM_TRANSACTION_FEES.ticketing.fixed * finalQty)
    : (finalAmount * PLATFORM_TRANSACTION_FEES.merchandise.percentage);

  const totalWithTax = finalAmount + taxAmount + platformFee;`;
  
  file = file.replace(/const totalWithTax = finalAmount \+ taxAmount;/g, replacement);
  modified = true;
}

if (file.includes('<div className="flex justify-between font-black text-white pt-2 border-t border-zinc-800">')) {
  // Let's find exactly where we show breakdown
  // We need to insert a Platform Fee line before the total.
  const platformFeeUI = `
                  <div className="flex justify-between text-zinc-400">
                    <span>Platform Fee</span>
                    <span>\${platformFee.toFixed(2)}</span>
                  </div>`;
  file = file.replace(/<div className="flex justify-between font-black text-white pt-2 border-t border-zinc-800">/g, platformFeeUI + '\n                  <div className="flex justify-between font-black text-white pt-2 border-t border-zinc-800">');
  modified = true;
}

if (modified) {
  fs.writeFileSync('./src/components/CustomerPayView.tsx', file);
  console.log('Fixed CustomerPayView.tsx');
}
