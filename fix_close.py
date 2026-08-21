with open('src/components/PromoterPortalView.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "INTERACTIVE MULTI-VENUE CALENDAR SYSTEM FOR PROMOTERS" in line:
        # the line before it is 3796
        # wait, let's look at the context.
        # 3795        )}
        if lines[i-2].strip() == ")}":
            lines[i-2] = "        </>)}\n"
        break

with open('src/components/PromoterPortalView.tsx', 'w') as f:
    f.writelines(lines)
