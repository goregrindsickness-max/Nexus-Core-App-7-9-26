import re

with open('src/App.tsx', 'r') as f:
    app = f.read()

# Replace the whole renderLegacyMetricsCarousel block
app = re.sub(r'  const renderLegacyMetricsCarousel = \(\) => \{.*?  \};\n', '', app, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(app)

