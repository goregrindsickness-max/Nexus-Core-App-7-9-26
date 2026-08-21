import re
with open("src/components/ReleasesCatalogTab.tsx", "r") as f:
    text = f.read()

text = text.replace('              {/* SECTION 2: PHYSICAL RELEASE INVENTORY (UNNESTED & FULL WIDTH) */}\n              <div className="space-y-4 w-full">',
'''              {/* SECTION 2: PHYSICAL RELEASE INVENTORY (UNNESTED & FULL WIDTH) */}
              <div className="space-y-4 w-full mt-10 bg-zinc-950/60 p-6 rounded-2xl border border-[#FF9900]/20 shadow-[0_0_15px_rgba(255,153,0,0.05)]">''')

with open("src/components/ReleasesCatalogTab.tsx", "w") as f:
    f.write(text)
print("Updated inventory.")
