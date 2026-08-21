import re
with open("src/components/UniversalSocialFeed.tsx", "r") as f:
    text = f.read()

# Fix the duplicate div
text = re.sub(r'(\<div className="bg-\[\#030303\]\/90 backdrop-blur-md border-b border-zinc-900\/85 flex flex-col"\>\s*)+', 
              '<div className="bg-[#030303]/90 backdrop-blur-md border-b border-zinc-900/85 flex flex-col">\n', 
              text)

# We want to hide the Top Navbar ONLY if isEmbedded is true.
# The Top Navbar starts at {/* Top Navbar */} and ends right before Profile Content Container
# We can just change `<div className="px-4 py-2 flex items-center justify-between">`
# to `{!isEmbedded && (<div className="px-4 py-2 flex items-center justify-between">`
# and find the end of that flex row (which is right before Profile Content Container).

match = re.search(r'(\{\/\* Top Navbar \*\/.*?\<div className="px-4 py-2 flex items-center justify-between"\>)', text, flags=re.DOTALL)
if match:
    # Just wrap the top navbar in a conditional
    # But wait, it's easier to just add a conditional class or just wrap the element.
    # The top navbar div is `<div className="px-4 py-2 flex items-center justify-between">`
    # Let's just add `${isEmbedded ? 'hidden' : 'flex'}` instead of `flex`!
    
    text = text.replace('<div className="px-4 py-2 flex items-center justify-between">',
                        '<div className={`px-4 py-2 items-center justify-between ${isEmbedded ? \'hidden\' : \'flex\'}`}>')
    print("Navbar replaced")

with open("src/components/UniversalSocialFeed.tsx", "w") as f:
    f.write(text)

print("Done")
