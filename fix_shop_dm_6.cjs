const fs = require('fs');
let code = fs.readFileSync('src/components/UniversalSocialFeed.tsx', 'utf8');

code = code.replace(/<button\s*\}\s*const itemToCheckout = \{ \.\.\.selectedShopItem \};/g,
`<button
                        onClick={() => {
                          if (selectedShopItem.sizes && selectedShopItem.sizes.length > 0 && !selectedSize) {
                            triggerNotification?.("Please select a size first.");
                            return;
                          }
                          const itemToCheckout = { ...selectedShopItem };`);

fs.writeFileSync('src/components/UniversalSocialFeed.tsx', code);
