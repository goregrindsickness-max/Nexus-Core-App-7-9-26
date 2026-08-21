import re

with open('src/components/UniversalSocialFeed.tsx', 'r') as f:
    content = f.read()

target = "Palette, DollarSign, MinusCircle, Slash} from 'lucide-react';"
replacement = "Palette, DollarSign, MinusCircle, Slash, Eye} from 'lucide-react';"

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/UniversalSocialFeed.tsx', 'w') as f:
        f.write(content)
    print("Fixed Eye import.")
else:
    print("Target not found.")
