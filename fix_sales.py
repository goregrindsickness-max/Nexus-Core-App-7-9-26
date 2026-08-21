import re

with open('src/components/PromoterPortalView.tsx', 'r') as f:
    content = f.read()

sales_regex = r"\)\s*:\s*activePortalTab === 'sales'\s*\?\s*\(\s*<motion\.div.*?\}\s*\)\s*\(\)\}\s*</div>\s*</div>\s*\)\s*;\s*\}\)\(\)\}\s*</div>\s*</div>\s*</motion\.div>"
# Actually it's easier to just use string indexing or a simpler regex.

idx_sales = content.find(") : activePortalTab === 'sales' ? (")
idx_social = content.find(") : activePortalTab === 'social' ? (")

if idx_sales != -1 and idx_social != -1:
    new_sales = """) : activePortalTab === 'sales' ? (
        <motion.div
          key="sales"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6 w-full items-center justify-center py-20 text-center"
        >
           <span className="text-4xl opacity-50 block">🎟️</span>
           <h3 className="text-sm font-black text-white uppercase tracking-widest mt-4">Ticket Sales (Cleared)</h3>
           <p className="text-[11px] text-zinc-500 font-mono max-w-md mt-2">The manual sales dashboard has been unmounted.</p>
        </motion.div>
      """
    content = content[:idx_sales] + new_sales + content[idx_social:]
    
    with open('src/components/PromoterPortalView.tsx', 'w') as f:
        f.write(content)
    print("Fixed sales block")
else:
    print(f"Could not find indices: sales={idx_sales}, social={idx_social}")
