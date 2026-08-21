import re

with open('src/App.tsx', 'r') as f:
    app = f.read()

# Let's find the occurrences of BrandNavigationHeader
print("Index of BrandNavHeader:", app.find('<BrandNavigationHeader'))
print("Index of activeTab === 'home-v2':", app.find("activeTab === 'home-v2' ?"))
