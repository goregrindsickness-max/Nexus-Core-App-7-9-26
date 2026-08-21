with open('src/components/PromoterPortalView.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
for i, line in enumerate(lines):
    if "block lg:hidden yellow-chase-border-mobile" in line:
        start_idx = i
        break

end_idx = -1
for i, line in enumerate(lines):
    if "INTERACTIVE MULTI-VENUE CALENDAR SYSTEM FOR PROMOTERS" in line:
        end_idx = i - 1  # 3792 (the line before the comment)
        break

if start_idx != -1 and end_idx != -1:
    lines.insert(end_idx, "        )}\n")
    lines.insert(start_idx, "        {!isolatedTab && (\n        <>\n")
    
    with open('src/components/PromoterPortalView.tsx', 'w') as f:
        f.writelines(lines)
    print(f"Patched successfully. start={start_idx} end={end_idx}")
else:
    print(f"Failed to find indices. start={start_idx} end={end_idx}")

