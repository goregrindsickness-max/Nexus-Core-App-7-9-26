import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

print("Checking targets")
target2 = """                                    {msg.text && (
                                      <p className="text-[15px] font-medium leading-relaxed break-words">{msg.text}</p>
                                    )}
                                    
                                    {/* Render Reactions */}"""

if target2 in content:
    print("target2 found")
else:
    print("target2 not found")
