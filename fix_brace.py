with open("src/components/UniversalSocialFeed.tsx", "r") as f:
    text = f.read()

text = text.replace('{.* Top Navbar */}}', '{/* Top Navbar */}')

with open("src/components/UniversalSocialFeed.tsx", "w") as f:
    f.write(text)
