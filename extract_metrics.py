import re

app = open('src/App.tsx').read()
match = re.search(r'(  const metrics = \[.*?  const renderLegacyMetricsCarousel = \(\) => {.*?    \);.*?  };)\n', app, re.DOTALL)
if match:
    code = match.group(1)
    with open('metrics_code.txt', 'w') as f:
        f.write(code)
    print("Found and saved!")
else:
    print("Not found!")
