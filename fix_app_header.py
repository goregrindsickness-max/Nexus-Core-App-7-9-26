import re
with open("src/App.tsx", "r") as f:
    text = f.read()

# Replace bg-[#0c0e12] with bg-black for the main header
text = text.replace('className="px-5 py-3 flex items-center justify-between border-b border-[#1b1e25] bg-[#0c0e12]"',
                    'className="px-5 py-3 flex items-center justify-between border-b border-[#1b1e25] bg-black"')

with open("src/App.tsx", "w") as f:
    f.write(text)

print("Done")
