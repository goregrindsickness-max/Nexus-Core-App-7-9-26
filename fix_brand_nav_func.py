with open('src/components/navigation/BrandNavigationHeader.tsx', 'r') as f:
    text = f.read()

text = text.replace('setShowWorkspaceRegistration(true);', 'onUpgradeToPro?.();')

text = text.replace('activePlan,', 'activePlan, onUpgradeToPro,')

with open('src/components/navigation/BrandNavigationHeader.tsx', 'w') as f:
    f.write(text)

