import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """                              <div className={`relative flex flex-col items-${isMe ? 'end' : 'start'} max-w-[85%] sm:max-w-[70%]`}>"""

replacement = """                              <div className={`relative flex flex-col items-${isMe ? 'end' : 'start'} max-w-[85%] sm:max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>"""

target2 = """                                <div className="mt-1 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">"""

replacement2 = """                                <div className={`mt-1 flex items-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pb-1 ${isMe ? 'order-1 pr-2' : 'order-2 pl-2'}`}>"""

if target in content and target2 in content:
    content = content.replace(target, replacement)
    content = content.replace(target2, replacement2)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed reaction icon layout.")
else:
    print("Targets not found.")
