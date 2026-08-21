with open('src/App.tsx', 'r') as f:
    app = f.read()

app = app.replace('import { GlobalModalsContainer }', "import { BrandNavigationHeader } from './components/navigation/BrandNavigationHeader';\nimport { GlobalModalsContainer }")

with open('src/App.tsx', 'w') as f:
    f.write(app)
