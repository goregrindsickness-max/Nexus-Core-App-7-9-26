import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(r"                                </div>\s+</div>\s+</div>\s+\);\s+}\)\}\s+</div>\s+</div>\s+\)}\s+</div>\s+</div>\s+</div>\s+\);\s+}\)\}\s+</div>", re.DOTALL)

def replace(match):
    return "                                </div>\n                              </div>\n                            </div>\n                          );\n                        })}\n                      </div>"

new_content = pattern.sub(replace, content)

if new_content != content:
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed dup loop via regex!")
else:
    print("Dup loop not found.")

