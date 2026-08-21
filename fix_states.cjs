const fs = require('fs');
let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

if (!content.includes('const [editingWarehouseItem')) {
  content = content.replace(
    "const [warehouseBandFilter, setWarehouseBandFilter] = useState('ALL_ROSTER');",
    "const [warehouseBandFilter, setWarehouseBandFilter] = useState('ALL_ROSTER');\n  const [editingWarehouseItem, setEditingWarehouseItem] = useState<any>(null);\n  const [isMerchIntakeOpen, setIsMerchIntakeOpen] = useState(false);\n  const [merchIntakeForm, setMerchIntakeForm] = useState({ title: '', qty: 0, cost: 0 });"
  );
}

fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
