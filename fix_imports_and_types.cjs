const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

if (!content.includes("import AddItemView")) {
  content = content.replace(
    "import { InventoryItem } from '../types';",
    "import { InventoryItem } from '../types';\nimport AddItemView from './AddItemView';"
  );
}

if (!content.includes("import MerchandisePrintersView")) {
  content = content.replace(
    "import AddItemView from './AddItemView';",
    "import AddItemView from './AddItemView';\nimport MerchandisePrintersView from './MerchandisePrintersView';"
  );
}

// Add merchandise-printers to the activeTab state type
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'roster' | 'releases' | 'calendar' | 'royalties' | 'analytics' | 'social' | 'storefront' | 'warehouse'>('roster');",
  "const [activeTab, setActiveTab] = useState<'roster' | 'releases' | 'calendar' | 'royalties' | 'analytics' | 'social' | 'storefront' | 'warehouse' | 'merchandise-printers'>('roster');"
);

fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
