import re
with open("src/components/UniversalSocialFeed.tsx", "r") as f:
    text = f.read()

text = text.replace('className="border-l-2 border-rose-900/30 pl-3 ml-6.5 mt-2.5 space-y-2"', 
                    'className="border-l-2 border-[#00ffcc]/30 pl-3 ml-6.5 mt-2.5 space-y-2"')

text = text.replace('className="border-l border-rose-900/30 pl-3 ml-6.5 mt-2 space-y-2 bg-black/15 p-2 rounded-lg"', 
                    'className="border-l border-[#00ffcc]/30 pl-3 ml-6.5 mt-2 space-y-2 bg-black/15 p-2 rounded-lg"')

with open("src/components/UniversalSocialFeed.tsx", "w") as f:
    f.write(text)

print("Done")
