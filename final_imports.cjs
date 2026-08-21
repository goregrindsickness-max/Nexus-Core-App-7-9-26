const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

if (!content.includes('import AddItemView')) {
  content = "import AddItemView from './AddItemView';\n" + content;
}

if (!content.includes('import MerchandisePrintersView')) {
  content = "import MerchandisePrintersView from './MerchandisePrintersView';\n" + content;
}

fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
