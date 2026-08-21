const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

if (!content.includes('import MerchandisePrintersView')) {
  content = content.replace(
    "import AddItemView from './AddItemView';",
    "import AddItemView from './AddItemView';\nimport MerchandisePrintersView from './MerchandisePrintersView';"
  );
}

if (!content.includes("activeTab === 'merchandise-printers'")) {
  const warehouseTabCode = "          {activeTab === 'warehouse' && (";
  const printersTabCode = `
          {activeTab === 'merchandise-printers' && (
             <div className="h-[calc(100vh-120px)] w-full overflow-hidden">
                <MerchandisePrintersView
                  onBack={() => setActiveTab('warehouse')}
                  triggerNotification={showLocalToast}
                  addLog={(msg) => console.log('Printers Log:', msg)}
                  inventory={[]}
                />
             </div>
          )}

`;
  content = content.replace(warehouseTabCode, printersTabCode + warehouseTabCode);
}

fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
