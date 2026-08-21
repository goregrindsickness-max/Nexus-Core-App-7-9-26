with open('src/components/PromoterDashboardViewV2.tsx', 'r') as f:
    lines = f.readlines()

new_content = """            <div className="space-y-10 max-w-5xl mx-auto animate-fade-in w-full pb-16 px-4 flex items-center justify-center min-h-[40vh]">
              <div className="text-center space-y-4 max-w-md mx-auto">
                <span className="text-4xl opacity-50 block">🛠️</span>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Workspace Construction</h3>
                <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">This dedicated promoter workspace is currently being engineered.</p>
              </div>
            </div>
"""

# Lines 2289 to 2828 correspond to indices 2288 to 2828 (since arrays are 0-indexed)
# Wait, let's verify line contents to be absolutely sure.
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "activeTab === 'WORKSPACE'" in line:
        start_idx = i
    if "activeTab === 'OFFERS'" in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    # Find the closing "} )" before OFFERS
    closing_idx = end_idx - 1
    while closing_idx > start_idx:
        if "}" in lines[closing_idx] and ")" in lines[closing_idx]:
            break
        closing_idx -= 1
        
    final_lines = lines[:start_idx + 1] + [new_content] + lines[closing_idx:]
    with open('src/components/PromoterDashboardViewV2.tsx', 'w') as f:
        f.writelines(final_lines)
    print(f"Patched successfully. start={start_idx} end={end_idx} close={closing_idx}")
else:
    print(f"Failed to find indices. start={start_idx} end={end_idx}")

