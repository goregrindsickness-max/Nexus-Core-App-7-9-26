import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = """                        {/* Call to Actions */}
                                     {/* Messages Body */}"""

replacement = """                        {/* Call to Actions */}
                        <div className="flex items-center gap-4 text-blue-500">
                          <button className="hover:text-blue-400 transition-colors">
                            <Phone className="w-6 h-6" />
                          </button>
                          <button className="hover:text-blue-400 transition-colors">
                            <Video className="w-7 h-7" />
                          </button>
                          <button onClick={() => setShowConversationSettings(true)} className="hover:text-blue-400 transition-colors">
                            <Info className="w-6 h-6" />
                          </button>
                        </div>
                      </div>

                      {/* Messages Body */}"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed header.")
else:
    print("Target not found.")

