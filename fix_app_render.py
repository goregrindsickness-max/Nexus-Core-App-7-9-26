with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace("renderLegacyMetricsCarousel={renderLegacyMetricsCarousel} ", "")

with open('src/App.tsx', 'w') as f:
    f.write(text)

