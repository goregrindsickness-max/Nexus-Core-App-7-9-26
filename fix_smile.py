import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<label className="pr-3 pl-1 text-blue-500 hover:text-blue-400 shrink-0 cursor-pointer">',
    '<label className="pr-3 pl-1 text-purple-500 hover:text-purple-400 shrink-0 cursor-pointer" onClick={(e) => { const input = e.currentTarget.previousElementSibling as HTMLInputElement; if (input) input.focus(); }}>'
)

# And make the other bottom bar icons purple instead of blue to match
content = content.replace('text-blue-500', 'text-purple-500').replace('bg-blue-500', 'bg-purple-500').replace('hover:text-blue-400', 'hover:text-purple-400')

with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)
print("Updated smile and blue to purple.")
