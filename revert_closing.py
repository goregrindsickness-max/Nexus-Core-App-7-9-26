with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace('distroDeckSubTab={distroDeckSubTab}\n          />\n          </>\n        )}', 'distroDeckSubTab={distroDeckSubTab}\n          />\n        )}')

with open('src/App.tsx', 'w') as f:
    f.write(app)

