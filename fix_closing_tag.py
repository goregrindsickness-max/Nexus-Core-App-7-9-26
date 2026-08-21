with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '/>' in line and ')}' in lines[i+1]:
        # found it!
        pass

# let's just use regex to insert </>\n before )} that comes after distroDeckSubTab={distroDeckSubTab}\n  />
import re
with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace('distroDeckSubTab={distroDeckSubTab}\n          />\n        )}', 'distroDeckSubTab={distroDeckSubTab}\n          />\n          </>\n        )}')

with open('src/App.tsx', 'w') as f:
    f.write(app)

