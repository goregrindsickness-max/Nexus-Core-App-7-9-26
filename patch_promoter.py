import re

with open('src/components/PromoterPortalView.tsx', 'r') as f:
    content = f.read()

# 1. Replace workspace block (lines 3037 to 3074)
workspace_regex = r"(if\s*\(activePortalTab === 'workspace'\)\s*\{\s*return\s*\(\s*<div className=\"w-full min-h-screen bg-\[#0c0e12\] flex flex-col\">\s*\{portalHeader\}\s*<div className=\"flex-1\">).*?(</EventWorkspaceView>|/>)\s*</div>\s*</div>\s*\);\s*\}"
def workspace_repl(m):
    return """if (activePortalTab === 'workspace') {
    return (
      <div className="w-full min-h-screen bg-[#0c0e12] flex flex-col">
        {portalHeader}

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <span className="text-4xl opacity-50 block">🛠️</span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Workspace Construction</h3>
            <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">This dedicated promoter workspace is currently being engineered.</p>
          </div>
        </div>
      </div>
    );
  }"""

content = re.sub(workspace_regex, workspace_repl, content, flags=re.DOTALL)


# 2. Replace offers block
offers_regex = r"(\)\s*:\s*activePortalTab === 'offers'\s*\?\s*\(\s*<motion\.div\s*key=\"offers\".*?)(?=\)\s*:\s*activePortalTab === 'sales'\s*\?\s*\()"
def offers_repl(m):
    return """) : activePortalTab === 'offers' ? (
        <motion.div
          key="offers"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6 w-full items-center justify-center py-20 text-center"
        >
           <span className="text-4xl opacity-50 block">📜</span>
           <h3 className="text-sm font-black text-white uppercase tracking-widest mt-4">Offers Desk (Cleared)</h3>
           <p className="text-[11px] text-zinc-500 font-mono max-w-md mt-2">The legacy offers desk has been decommissioned.</p>
        </motion.div>
      """

content = re.sub(offers_regex, offers_repl, content, flags=re.DOTALL)


# 3. Replace sales block (including old-sales)
sales_regex = r"(\)\s*:\s*activePortalTab === 'sales'\s*\?\s*\(\s*<motion\.div\s*key=\"sales\".*?)(?=\)\s*:\s*activePortalTab === 'social'\s*\?\s*\()"
def sales_repl(m):
    return """) : activePortalTab === 'sales' ? (
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

content = re.sub(sales_regex, sales_repl, content, flags=re.DOTALL)

with open('src/components/PromoterPortalView.tsx', 'w') as f:
    f.write(content)

print("Patched PromoterPortalView.tsx")
