import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                  className="w-full bg-transparent px-4 py-2 text-[15px] text-white placeholder:text-zinc-400 focus:outline-none"
                                />"""

replacement = """                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                  onPaste={(e) => {
                                    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
                                      e.preventDefault();
                                      const file = e.clipboardData.files[0];
                                      if (file.type.startsWith('image/')) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          if (event.target?.result) {
                                            handleSendMessage({ image: event.target.result as string });
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }
                                  }}
                                  className="w-full bg-transparent px-4 py-2 text-[15px] text-white placeholder:text-zinc-400 focus:outline-none"
                                />"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed paste.")
else:
    print("Target not found.")
