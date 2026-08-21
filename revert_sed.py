with open('src/components/PromoterPortalView.tsx', 'r') as f:
    content = f.read()
content = content.replace("        </>\n        )}", "        )}")
with open('src/components/PromoterPortalView.tsx', 'w') as f:
    f.write(content)
