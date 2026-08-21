import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

# 1. Update Active Message Pane container to be fixed size
content = content.replace(
    '<div className={`w-full flex flex-col bg-black min-h-screen ${!selectedChatId ? \'hidden\' : \'flex\'}`}>',
    '<div className={`w-full flex flex-col bg-black fixed inset-0 z-[100] h-[100dvh] max-h-[100dvh] overflow-hidden ${!selectedChatId ? \'hidden\' : \'flex\'}`}>'
)

# 2. Update Messages Body to have textured background
content = content.replace(
    '<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">',
    '<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0510] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),transparent)]">'
)

# 3. Update chat bubble styling to be more squared and purple
content = content.replace(
    "bg-blue-600 text-white rounded-2xl rounded-tr-sm",
    "bg-purple-600 text-white rounded-xl rounded-tr-sm"
)
content = content.replace(
    "bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm",
    "bg-zinc-800 text-zinc-200 rounded-xl rounded-tl-sm"
)

with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
    f.write(content)
print("Updated styles.")
