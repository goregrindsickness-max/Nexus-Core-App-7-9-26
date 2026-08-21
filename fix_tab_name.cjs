const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

// Replace all setActiveTab('master-catalog') with setActiveTab('releases')
content = content.replace(/setActiveTab\('master-catalog'\)/g, "setActiveTab('releases')");

fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
console.log('Update complete!');
