const fs = require('fs');

let content = fs.readFileSync('src/components/LabelDashboardView.tsx', 'utf8');

// Add AddItemView import if not there
if (!content.includes("import AddItemView")) {
  content = content.replace(
    "import { InventoryItem } from '../types';",
    "import { InventoryItem } from '../types';\nimport AddItemView from './AddItemView';"
  );
}

// Add state for editingWarehouseItem and isMerchIntakeOpen
if (!content.includes("editingWarehouseItem")) {
  content = content.replace(
    "const [warehouseBandFilter, setWarehouseBandFilter] = useState<string>('ALL_ROSTER');",
    "const [warehouseBandFilter, setWarehouseBandFilter] = useState<string>('ALL_ROSTER');\n  const [editingWarehouseItem, setEditingWarehouseItem] = useState<InventoryItem | null>(null);\n  const [isMerchIntakeOpen, setIsMerchIntakeOpen] = useState(false);\n  const [merchIntakeForm, setMerchIntakeForm] = useState({ title: '', qty: 0, cost: 0 });"
  );
}

// Update the select options
content = content.replace(
  '<option value="ALL_ROSTER">ALL LABEL MERCHANDISE & ROSTER</option>',
  '<option value="ALL_ROSTER">ALL LABEL MERCHANDISE & ROSTER</option>\n                    <option value="LABEL_ONLY">LABEL / NON-BAND MERCH</option>'
);

// Update filteredItems to handle LABEL_ONLY
content = content.replace(
  "return warehouseBandFilter === 'ALL_ROSTER' || item.bandId === warehouseBandFilter;",
  "return warehouseBandFilter === 'ALL_ROSTER' || item.bandId === warehouseBandFilter || (warehouseBandFilter === 'LABEL_ONLY' && !item.bandId);"
);

// We need to refactor the bento grid into two rows.
const oldGrid = `<div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingReleaseId(null);
                    setEditingApparelId(null);
                    setActiveTab('releases');
                  }}
                  className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-[#00ffcc] py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,255,204,0.1)] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  ADD ITEM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const activeBand = labelRosterData[0] || null;
                    if (activeBand) {
                      setActiveRestockBand(activeBand);
                    }
                  }}
                  className="bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/50 text-[#FF9900] py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,153,0,0.1)] flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  VAN TRANSFER
                </button>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                     setWarehouseAuditLogs([
                      {
                        id: \`log_\${Date.now()}\`,
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        operator: 'HQ Automated',
                        type: 'RECONCILE',
                        message: 'Audit discrepancy log initiated.'
                      }, ...warehouseAuditLogs
                    ]);
                    showLocalToast('AUDIT LOG OPENED');
                  }}
                  className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 text-red-500 py-2.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  LOG INVENTORY DISCREPANCY (AUDIT)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('releases');
                    showLocalToast('DIRECTED TO RE-ORDER CATALOG');
                  }}
                  className="w-full bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/50 text-emerald-500 py-2.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  NEED TO RE-STOCK? CLICK HERE!
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('storefront');
                  }}
                  className="w-full bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/50 text-purple-400 py-2.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  GO TO YOUR PUBLIC STOREFRONT
                </button>
              </div>`;

const newGrid = `<div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingWarehouseItem({
                      id: '',
                      name: '',
                      price: 0,
                      category: 'apparel',
                      table_stock: 0,
                      van_stock: 0,
                      total_sales: 0,
                      image_url: ''
                    });
                  }}
                  className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 text-[#00ffcc] py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,255,204,0.1)] flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  ADD ITEM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const activeBand = labelRosterData[0] || null;
                    if (activeBand) {
                      setActiveRestockBand(activeBand);
                    }
                  }}
                  className="bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/50 text-[#FF9900] py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,153,0,0.1)] flex flex-col items-center justify-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  VAN TRANSFER
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                     setIsMerchIntakeOpen(true);
                  }}
                  className="bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/50 text-blue-400 py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  MERCH PRODUCTION INTAKE
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('merchandise-printers' as any);
                  }}
                  className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/50 text-purple-400 py-4 rounded-xl font-mono text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  NEED TO RE-STOCK? CLICK HERE!
                </button>
              </div>`;

if (content.includes(oldGrid)) {
  content = content.replace(oldGrid, newGrid);
} else {
  // Try to find the start and end and replace
  const s = content.indexOf('{/* TOP ACTION BUTTONS - LIKE INVENTORY PORTAL */}');
  const e = content.indexOf('{/* DROPDOWN TO SELECT BAND / LABEL MERCHANDISE */}');
  if (s !== -1 && e !== -1) {
    content = content.substring(0, s) + '{/* TOP ACTION BUTTONS - LIKE INVENTORY PORTAL */}\n              ' + newGrid + '\n\n              ' + content.substring(e);
  }
}

// Update the item onClick
const oldItemClick = `onClick={() => {
                          if (item.category === 'media') {
                            setEditingReleaseId(item.id);
                          } else {
                            setEditingApparelId(item.id);
                          }
                          setActiveTab('releases');
                        }}`;

const newItemClick = `onClick={() => setEditingWarehouseItem(item as any)}`;

content = content.replace(oldItemClick, newItemClick);

// Handle conditional rendering of AddItemView or Warehouse grid
const warehouseGridStart = `{/* DROPDOWN TO SELECT BAND / LABEL MERCHANDISE */}`;

const warehouseWrapperStart = `
              {editingWarehouseItem ? (
                <div className="bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden relative min-h-[600px]">
                  <AddItemView 
                    initialItem={editingWarehouseItem.id ? editingWarehouseItem : undefined}
                    onBack={() => setEditingWarehouseItem(null)}
                    onSave={async (item) => {
                      showLocalToast(editingWarehouseItem.id ? 'Item Updated' : 'Item Added');
                      setEditingWarehouseItem(null);
                      return true;
                    }}
                    onDelete={(id) => {
                      showLocalToast('Item Deleted');
                      setEditingWarehouseItem(null);
                    }}
                    triggerNotification={showLocalToast}
                  />
                </div>
              ) : (
                <>
`;

const warehouseWrapperEnd = `
                </>
              )}
`;

const invGridEnd = `})()}
              </div>`;

if (!content.includes('editingWarehouseItem ? (')) {
  const s = content.indexOf(warehouseGridStart);
  const e = content.indexOf(invGridEnd) + invGridEnd.length;
  
  if (s !== -1 && e !== -1) {
    content = content.substring(0, s) + warehouseWrapperStart + content.substring(s, e) + warehouseWrapperEnd + content.substring(e);
  }
}

// Add Intake Modal
const intakeModal = `
      {/* MERCH PRODUCTION INTAKE MODAL */}
      <AnimatePresence>
        {isMerchIntakeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-2 text-blue-400">
                  <Package className="w-5 h-5" />
                  <h3 className="font-mono font-black tracking-widest text-sm">MERCH PRODUCTION INTAKE</h3>
                </div>
                <button onClick={() => setIsMerchIntakeOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 block">Item Name</label>
                  <input
                    type="text"
                    value={merchIntakeForm.title}
                    onChange={e => setMerchIntakeForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white font-sans text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="e.g. Tour Hoodies Batch 2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 block">Quantity Received</label>
                    <input
                      type="number"
                      value={merchIntakeForm.qty || ''}
                      onChange={e => setMerchIntakeForm(prev => ({ ...prev, qty: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white font-sans text-sm focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1 block">Unit Cost ($)</label>
                    <input
                      type="number"
                      value={merchIntakeForm.cost || ''}
                      onChange={e => setMerchIntakeForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white font-sans text-sm focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-zinc-500 font-mono leading-relaxed bg-blue-950/20 p-3 rounded-lg border border-blue-900/30">
                  Record new shipments of goods received by the label. These can then be distributed to the band, the public storefront, or kept by the label as promo/backstock.
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-end gap-3">
                <button
                  onClick={() => setIsMerchIntakeOpen(false)}
                  className="px-4 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    if (!merchIntakeForm.title) return showLocalToast('Please enter an item name');
                    showLocalToast(\`INTAKE SUCCESSFUL: \${merchIntakeForm.qty}x \${merchIntakeForm.title}\`);
                    setIsMerchIntakeOpen(false);
                    setMerchIntakeForm({ title: '', qty: 0, cost: 0 });
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-black uppercase rounded-lg transition-all"
                >
                  RECORD INTAKE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

if (!content.includes('MERCH PRODUCTION INTAKE MODAL')) {
  content = content.replace('{/* WAREHOUSE RESTOCK TO BAND MODAL */}', intakeModal + '\n\n    {/* WAREHOUSE RESTOCK TO BAND MODAL */}');
}

fs.writeFileSync('src/components/LabelDashboardView.tsx', content);
console.log('Update complete!');
