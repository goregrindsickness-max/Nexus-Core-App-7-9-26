import re
with open("src/components/UniversalSocialFeed.tsx", "r") as f:
    text = f.read()

text = re.sub(r'\{\/\* Header Container \(Top Navbar \& Live Tonight Combined\) \*\/.*?\{\/\* Top Navbar \*\/',
              '{/* Header Container (Top Navbar & Live Tonight Combined) */}\n      <div className="bg-[#030303]/90 backdrop-blur-md border-b border-zinc-900/85 flex flex-col">\n        {/* Top Navbar */}', text, flags=re.DOTALL)

with open("src/components/UniversalSocialFeed.tsx", "w") as f:
    f.write(text)
print("Done")
